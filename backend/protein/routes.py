"""
routes.py — FastAPI router for /api/generate-protein
Person 2 owns this file.

Matches the agreed API contract in shared/models.py:
  POST /api/generate-protein
    Body:  GenerateProteinRequest
    Reply: GenerateProteinResponse  { sequence, pdb_url }
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .generator import generate_protein_sequence
from .esmfold import predict_structure

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["protein"])


# ---------------------------------------------------------------------------
# Request / Response schemas
# (mirrored from shared/models.py — keep in sync)
# ---------------------------------------------------------------------------

class GenerateProteinRequest(BaseModel):
    target_protein: str = Field(
        ...,
        description="Name of the target protein, e.g. 'PPARG'",
        examples=["PPARG"],
    )
    seed_sequence: str = Field(
        default="<|endoftext|>",
        description="Optional seed AA sequence for ProtGPT2 generation.",
    )
    max_length: int = Field(
        default=200,
        ge=50,
        le=400,
        description="Max token length for generated sequence.",
    )


class GenerateProteinResponse(BaseModel):
    sequence: str = Field(..., description="Generated amino-acid sequence.")
    pdb_url: str = Field(..., description="Relative URL to the predicted PDB file.")


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/generate-protein",
    response_model=GenerateProteinResponse,
    summary="Generate a therapeutic protein and predict its 3D structure",
)
async def generate_protein(request: GenerateProteinRequest):
    """
    1. Generates a candidate therapeutic protein sequence with ProtGPT2.
    2. Folds the sequence into a 3D structure via ESMFold.
    3. Returns the sequence and a URL to the .pdb file.
    """
    # --- Step 1: sequence generation ---
    try:
        sequence = generate_protein_sequence(
            target_protein=request.target_protein,
            seed_sequence=request.seed_sequence,
            max_length=request.max_length,
        )
    except Exception as exc:
        logger.exception("ProtGPT2 generation failed")
        raise HTTPException(
            status_code=500,
            detail=f"Protein generation failed: {str(exc)}",
        )

    # --- Step 2: structure prediction ---
    try:
        pdb_url = predict_structure(sequence)
    except Exception as exc:
        logger.exception("ESMFold prediction failed")
        raise HTTPException(
            status_code=502,
            detail=f"Structure prediction failed: {str(exc)}",
        )

    return GenerateProteinResponse(sequence=sequence, pdb_url=pdb_url)


# ---------------------------------------------------------------------------
# Health check (useful for HuggingFace Spaces cold-start detection)
# ---------------------------------------------------------------------------

@router.get("/generate-protein/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "protein-generation"}