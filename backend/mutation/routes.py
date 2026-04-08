# ============================================================
# MutaCure AR — mutation/routes.py (/api/mutate endpoint)
# ============================================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from mutation.clinvar import get_variant_info
from mutation.risk_model import predict_risk

router = APIRouter()

# --- Request schema ---
class MutationRequest(BaseModel):
    gene: str
    variant_type: str = "snv"
    chromosome:   int = 1

# --- Response schema ---
class MutationResponse(BaseModel):
    gene:           str
    variant:        str
    target_protein: str
    risk:           float
    clinvar_id:     str

@router.post("/mutate", response_model=MutationResponse)
def mutate(request: MutationRequest):
    """
    Main endpoint:
    Input:  gene name
    Output: gene, variant, target_protein, risk score
    """
    if not request.gene or len(request.gene) < 2:
        raise HTTPException(status_code=400, detail="Invalid gene name")

    # 1. Get variant info from ClinVar
    variant_info = get_variant_info(request.gene)

    # 2. Get risk score from ML model
    risk = predict_risk(
        gene=request.gene,
        variant_type=request.variant_type,
        chromosome=request.chromosome
    )

    return MutationResponse(
        gene=           variant_info["gene"],
        variant=        variant_info["variant"],
        target_protein= variant_info["target_protein"],
        risk=           risk,
        clinvar_id=     variant_info["clinvar_id"]
    )


@router.get("/mutate/{gene}")
def mutate_get(gene: str):
    """Quick GET version for browser testing"""
    variant_info = get_variant_info(gene)
    risk = predict_risk(gene=gene)

    return {
        "gene":           variant_info["gene"],
        "variant":        variant_info["variant"],
        "target_protein": variant_info["target_protein"],
        "risk":           risk,
        "clinvar_id":     variant_info["clinvar_id"]
    }