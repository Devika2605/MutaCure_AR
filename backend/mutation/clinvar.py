# ============================================================
# MutaCure AR — clinvar.py (ClinVar Data Fetcher)
# ============================================================

import requests

NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

def get_variant_info(gene: str) -> dict:
    """
    Query ClinVar for a gene → return variant + protein target
    """
    try:
        # Step 1: Search ClinVar for gene
        search_url = f"{NCBI_BASE}/esearch.fcgi"
        search_params = {
            "db":     "clinvar",
            "term":   f"{gene}[gene] AND pathogenic[clinsig]",
            "retmax": 1,
            "retmode":"json"
        }
        search_resp = requests.get(search_url, params=search_params, timeout=10)
        search_data = search_resp.json()

        id_list = search_data.get("esearchresult", {}).get("idlist", [])
        if not id_list:
            return _default_response(gene)

        clinvar_id = id_list[0]

        # Step 2: Fetch summary for that ID
        summary_url = f"{NCBI_BASE}/esummary.fcgi"
        summary_params = {
            "db":     "clinvar",
            "id":     clinvar_id,
            "retmode":"json"
        }
        summary_resp = requests.get(summary_url, params=summary_params, timeout=10)
        summary_data = summary_resp.json()

        result = summary_data.get("result", {}).get(clinvar_id, {})

        # Extract variant name (rs ID or title)
        variant = result.get("title", "unknown")
        rsid    = _extract_rsid(result)

        # Target protein mapping (simplified)
        protein = _gene_to_protein(gene)

        return {
            "gene":           gene.upper(),
            "variant":        rsid if rsid else variant[:20],
            "target_protein": protein,
            "clinvar_id":     clinvar_id
        }

    except Exception as e:
        print(f"ClinVar error: {e}")
        return _default_response(gene)


def _extract_rsid(result: dict) -> str:
    """Extract rs ID from ClinVar result"""
    try:
        variation_set = result.get("variation_set", [])
        if variation_set:
            for v in variation_set:
                name = v.get("variation_name", "")
                if "rs" in name.lower():
                    # Extract rs number
                    import re
                    match = re.search(r'rs\d+', name, re.IGNORECASE)
                    if match:
                        return match.group(0)
    except:
        pass
    return ""


def _gene_to_protein(gene: str) -> str:
    """Simple gene → target protein mapping"""
    mapping = {
        "TCF7L2": "PPARG",
        "BRCA1":  "TP53",
        "BRCA2":  "PALB2",
        "EGFR":   "ERBB2",
        "TP53":   "MDM2",
        "PTEN":   "AKT1",
        "KRAS":   "BRAF",
        "HFE":    "TFR1",
        "CFTR":   "CFTR",
        "APOE":   "LDLR",
    }
    return mapping.get(gene.upper(), f"{gene.upper()}_PROTEIN")


def _default_response(gene: str) -> dict:
    """Fallback if ClinVar query fails"""
    return {
        "gene":           gene.upper(),
        "variant":        "rs_unknown",
        "target_protein": _gene_to_protein(gene),
        "clinvar_id":     "N/A"
    }