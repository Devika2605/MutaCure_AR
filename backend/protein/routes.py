"""
routes.py — FastAPI router for /api/generate-protein
Person 2 owns this file.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

from .generator import generate_protein_sequence
from .esmfold import predict_structure

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["protein"])


class GenerateProteinRequest(BaseModel):
    target_protein: str = Field(..., examples=["PPARG"])
    seed_sequence: str = Field(default="")
    max_length: int = Field(default=200, ge=50, le=400)
    apply_mutation: bool = Field(default=True)


class GenerateProteinResponse(BaseModel):
    sequence: str
    wildtype: str
    pdb_url: str
    mutation_info: str
    mutated_positions: List[int]


@router.post("/generate-protein", response_model=GenerateProteinResponse)
async def generate_protein(request: GenerateProteinRequest):
    # Step 1: get sequence + apply mutation
    try:
        result = generate_protein_sequence(
            target_protein=request.target_protein,
            seed_sequence=request.seed_sequence,
            max_length=request.max_length,
            apply_mutation=request.apply_mutation,
        )
    except Exception as exc:
        logger.exception("Sequence generation failed")
        raise HTTPException(status_code=500, detail=f"Sequence generation failed: {exc}")

    # Step 2: fold the mutated sequence
    try:
        pdb_url = predict_structure(result["sequence"])
    except Exception as exc:
        logger.exception("ESMFold prediction failed")
        raise HTTPException(status_code=502, detail=f"Structure prediction failed: {exc}")

    return GenerateProteinResponse(
        sequence=result["sequence"],
        wildtype=result["wildtype"],
        pdb_url=pdb_url,
        mutation_info=result["mutation_info"],
        mutated_positions=result["mutated_positions"],
    )


@router.get("/generate-protein/health")
async def health():
    return {"status": "ok", "service": "protein-generation"}