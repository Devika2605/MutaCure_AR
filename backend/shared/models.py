"""
shared/models.py — Frozen API contract. Edit only with both teammates present.
Defines all request/response schemas shared between Person 1 and Person 2.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ---------------------------------------------------------------------------
# /api/mutate  (Person 1 owns the endpoint, Person 2 consumes the response)
# ---------------------------------------------------------------------------

class MutateRequest(BaseModel):
    disease: str = Field(
        ...,
        description="Disease name or rsID to look up in ClinVar.",
        examples=["Type 2 Diabetes", "rs7903146"],
    )


class MutateResponse(BaseModel):
    gene: str = Field(..., examples=["TCF7L2"])
    variant: str = Field(..., examples=["rs7903146"])
    target_protein: str = Field(..., examples=["PPARG"])
    risk: float = Field(..., ge=0.0, le=1.0, examples=[0.23])


# ---------------------------------------------------------------------------
# /api/generate-protein  (Person 2 owns this endpoint)
# ---------------------------------------------------------------------------

class GenerateProteinRequest(BaseModel):
    target_protein: str = Field(
        ...,
        description="Target protein name from /api/mutate response.",
        examples=["PPARG"],
    )
    seed_sequence: str = Field(
        default="<|endoftext|>",
        description="Optional AA seed for ProtGPT2.",
    )
    max_length: int = Field(default=200, ge=50, le=400)


class GenerateProteinResponse(BaseModel):
    sequence: str = Field(..., description="Generated amino-acid sequence.")
    pdb_url: str = Field(..., description="Relative URL to the predicted .pdb file.")


# ---------------------------------------------------------------------------
# Shared error envelope (both routes use this for consistent error shape)
# ---------------------------------------------------------------------------

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None