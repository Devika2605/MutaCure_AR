# ============================================================
# MutaCure AR — risk_model.py (Risk Score Predictor)
# ============================================================

import joblib
import pandas as pd
import os

# Paths to saved model files
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "risk_model.pkl")
GENE_PATH  = os.path.join(BASE_DIR, "models", "le_gene.pkl")
TYPE_PATH  = os.path.join(BASE_DIR, "models", "le_type.pkl")

# Load once at startup
print("📦 Loading risk model...")
model   = joblib.load(MODEL_PATH)
le_gene = joblib.load(GENE_PATH)
le_type = joblib.load(TYPE_PATH)
print("✅ Risk model loaded.")


def predict_risk(gene: str, variant_type: str = "snv", chromosome: int = 1) -> float:
    """
    Predict risk score (0.0 - 1.0) for a given gene + variant
    """
    try:
        # Encode gene
        gene_upper = gene.upper().strip()
        if gene_upper in le_gene.classes_:
            gene_enc = le_gene.transform([gene_upper])[0]
        else:
            gene_enc = 0  # unknown gene fallback

        # Encode type
        type_lower = variant_type.lower().strip()
        if type_lower in le_type.classes_:
            type_enc = le_type.transform([type_lower])[0]
        else:
            type_enc = 0

        # has_rsid — assume True for known genes
        has_rsid = 1 if gene_upper in le_gene.classes_ else 0

        # Build feature row
        sample = pd.DataFrame([{
            "type_enc":  type_enc,
            "gene_enc":  gene_enc,
            "has_rsid":  has_rsid,
            "chrom_enc": chromosome
        }])

        # Predict probability of being pathogenic
        risk_score = model.predict_proba(sample)[0][1]
        return round(float(risk_score), 4)

    except Exception as e:
        print(f"Risk prediction error: {e}")
        return 0.5  # neutral fallback