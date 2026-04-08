"""
esmfold.py — ESMFold-based 3D protein structure prediction
Person 2 owns this file.

ESMFold is accessed via the ESM Metagenomic Atlas public API so we don't
have to run the full model locally (it needs ~40 GB VRAM).  For hackathon
purposes this is fast enough; swap to a local ESMFold instance if needed.
"""

import os
import uuid
import logging
import httpx

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

# Public ESMFold API endpoint (Meta / ESM Atlas)
ESMFOLD_API_URL = "https://api.esmatlas.com/foldSequence/v1/pdb/"

# Where PDB files are saved — must be served as static files by FastAPI
PDB_OUTPUT_DIR = os.environ.get("PDB_OUTPUT_DIR", "files")

# Timeout in seconds for the ESMFold API call (fold can take ~30 s)
REQUEST_TIMEOUT = 120


def predict_structure(sequence: str) -> str:
    """
    Send an amino-acid sequence to the ESMFold API and save the returned
    PDB file locally.

    Args:
        sequence: Amino-acid sequence string (uppercase, standard AA only).

    Returns:
        Relative URL path to the saved PDB file, e.g. "/files/protein_<uuid>.pdb"

    Raises:
        httpx.HTTPStatusError: If the ESMFold API returns a non-2xx status.
        ValueError:             If the response body is not a valid PDB.
    """
    _ensure_output_dir()

    # ESMFold has a ~400 AA limit on the public API; truncate gracefully
    if len(sequence) > 400:
        logger.warning(
            f"Sequence length {len(sequence)} exceeds ESMFold API limit; truncating to 400."
        )
        sequence = sequence[:400]

    logger.info(f"Sending sequence (len={len(sequence)}) to ESMFold API...")

    response = httpx.post(
        ESMFOLD_API_URL,
        content=sequence,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()

    pdb_content = response.text

    if not _is_valid_pdb(pdb_content):
        raise ValueError(
            "ESMFold API response does not look like a valid PDB file. "
            f"First 200 chars: {pdb_content[:200]}"
        )

    filename = f"protein_{uuid.uuid4().hex[:8]}.pdb"
    filepath = os.path.join(PDB_OUTPUT_DIR, filename)

    with open(filepath, "w") as f:
        f.write(pdb_content)

    pdb_url = f"/files/{filename}"
    logger.info(f"PDB saved: {filepath}  →  URL: {pdb_url}")
    return pdb_url


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ensure_output_dir():
    os.makedirs(PDB_OUTPUT_DIR, exist_ok=True)


def _is_valid_pdb(content: str) -> bool:
    """
    Light sanity check: a PDB file should contain ATOM or HETATM records.
    """
    return "ATOM" in content or "HETATM" in content