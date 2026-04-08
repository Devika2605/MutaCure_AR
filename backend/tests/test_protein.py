"""
tests/test_protein.py — Tests for Person 2's protein generation pipeline.

Run with:
    pytest tests/test_protein.py -v

Integration tests (real ESMFold API, needs internet):
    pytest tests/test_protein.py -v -m integration
"""

import pytest
from unittest.mock import patch, MagicMock

from protein.generator import _clean_sequence
from protein.esmfold import _is_valid_pdb


# ===========================================================================
# 1. _clean_sequence  (no model, no network)
# ===========================================================================

def test_removes_non_amino_acid_chars():
    assert _clean_sequence("MKF\nLL!123") == "MKFLL"

def test_uppercases_output():
    assert _clean_sequence("mkfll") == "MKFLL"

def test_strips_non_standard_amino_acids():
    result = _clean_sequence("MKBZXFLL")
    assert "B" not in result
    assert "Z" not in result
    assert "X" not in result

def test_empty_sequence():
    assert _clean_sequence("") == ""

def test_all_standard_aa_kept():
    standard = "ACDEFGHIKLMNPQRSTVWY"
    assert _clean_sequence(standard) == standard


# ===========================================================================
# 2. _is_valid_pdb  (no network)
# ===========================================================================

def test_valid_pdb_atom():
    assert _is_valid_pdb("ATOM   1  N   ALA A   1      1.0  2.0  3.0") is True

def test_valid_pdb_hetatm():
    assert _is_valid_pdb("HETATM   1  C1  LIG A 100      1.0  2.0  3.0") is True

def test_invalid_pdb_returns_false():
    assert _is_valid_pdb("error: sequence too long") is False

def test_empty_pdb_returns_false():
    assert _is_valid_pdb("") is False


# ===========================================================================
# 3. predict_structure — mocked HTTP (no network)
# ===========================================================================

@patch("protein.esmfold.httpx.post")
def test_predict_structure_saves_pdb(mock_post, tmp_path):
    import protein.esmfold as em
    em.PDB_OUTPUT_DIR = str(tmp_path)

    mock_post.return_value = MagicMock(
        text="ATOM   1  N   ALA A   1      1.0  2.0  3.0\nEND\n",
        raise_for_status=MagicMock(),
    )

    url = em.predict_structure("MKFLLACDE")

    assert url.startswith("/files/")
    assert url.endswith(".pdb")
    assert len(list(tmp_path.glob("*.pdb"))) == 1


@patch("protein.esmfold.httpx.post")
def test_predict_structure_truncates_long_seq(mock_post, tmp_path):
    import protein.esmfold as em
    em.PDB_OUTPUT_DIR = str(tmp_path)

    mock_post.return_value = MagicMock(
        text="ATOM   1  N   ALA A   1      1.0  2.0  3.0\nEND\n",
        raise_for_status=MagicMock(),
    )

    em.predict_structure("M" * 500)

    sent = mock_post.call_args[1]["content"]
    assert len(sent) <= 400


@patch("protein.esmfold.httpx.post")
def test_predict_structure_raises_on_bad_response(mock_post, tmp_path):
    import protein.esmfold as em
    em.PDB_OUTPUT_DIR = str(tmp_path)

    mock_post.return_value = MagicMock(
        text="error: something went wrong",
        raise_for_status=MagicMock(),
    )

    with pytest.raises(ValueError, match="valid PDB file"):
        em.predict_structure("MKFLL")


# ===========================================================================
# 4. FastAPI endpoint — mocked (no model, no network)
# ===========================================================================

@patch("protein.routes.generate_protein_sequence", return_value="MKFLLACDE")
@patch("protein.routes.predict_structure", return_value="/files/protein_abc123.pdb")
def test_endpoint_success(mock_fold, mock_gen):
    from fastapi.testclient import TestClient
    from main import app
    client = TestClient(app)

    r = client.post("/api/generate-protein", json={"target_protein": "PPARG"})

    assert r.status_code == 200
    data = r.json()
    assert data["sequence"] == "MKFLLACDE"
    assert data["pdb_url"] == "/files/protein_abc123.pdb"


def test_endpoint_health():
    from fastapi.testclient import TestClient
    from main import app
    client = TestClient(app)

    r = client.get("/api/generate-protein/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_endpoint_missing_target_protein():
    from fastapi.testclient import TestClient
    from main import app
    client = TestClient(app)

    r = client.post("/api/generate-protein", json={})
    assert r.status_code == 422


# ===========================================================================
# 5. Integration — real ESMFold API (opt-in only)
# ===========================================================================

@pytest.mark.integration
def test_real_esmfold_fold(tmp_path):
    """Hits the real ESMFold API. Run with: pytest -m integration"""
    import protein.esmfold as em
    em.PDB_OUTPUT_DIR = str(tmp_path)

    url = em.predict_structure("NLYIQWLKDGGPSSGRPPPS")

    assert url.startswith("/files/")
    pdb_text = list(tmp_path.glob("*.pdb"))[0].read_text()
    assert "ATOM" in pdb_text