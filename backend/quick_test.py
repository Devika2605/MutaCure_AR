#!/usr/bin/env python3
"""
quick_test.py — Manually smoke-test the protein pipeline without pytest.

Usage (from backend/ directory):
    python quick_test.py --step esmfold        # test only ESMFold API
    python quick_test.py --step sequence       # test only sequence cleaning
    python quick_test.py --step endpoint       # test the FastAPI endpoint (server must be running)
    python quick_test.py --step all            # run all fast checks
"""

import argparse
import sys


def test_sequence_cleaning():
    print("\n── Test: _clean_sequence ──")
    from protein.generator import _clean_sequence

    cases = [
        ("MKF\nLL!123", "MKFLL"),
        ("mkfll",        "MKFLL"),
        ("MKBZXFLL",     "MKFLL"),   # B, Z, X stripped
        ("",             ""),
    ]
    for raw, expected in cases:
        result = _clean_sequence(raw)
        status = "✅" if result == expected else "❌"
        print(f"  {status}  input={repr(raw)!r:20s}  →  {result!r}  (expected {expected!r})")


def test_esmfold():
    print("\n── Test: ESMFold API (real network call) ──")
    import tempfile, os
    import protein.esmfold as esmfold_module

    with tempfile.TemporaryDirectory() as tmp:
        esmfold_module.PDB_OUTPUT_DIR = tmp
        # Trp-cage: shortest well-known miniprotein (20 AA), folds fast
        sequence = "NLYIQWLKDGGPSSGRPPPS"
        print(f"  Sending sequence: {sequence}")
        print(f"  Calling {esmfold_module.ESMFOLD_API_URL} ...")

        try:
            url = esmfold_module.predict_structure(sequence)
            files = os.listdir(tmp)
            size = os.path.getsize(os.path.join(tmp, files[0]))
            print(f"  ✅  PDB saved → {url}  ({size} bytes)")
        except Exception as e:
            print(f"  ❌  ESMFold call failed: {e}")
            sys.exit(1)


def test_endpoint():
    print("\n── Test: FastAPI endpoint (server must be running on :8000) ──")
    import httpx

    url = "http://localhost:8000/api/generate-protein"
    payload = {"target_protein": "PPARG", "max_length": 100}
    print(f"  POST {url}  payload={payload}")

    try:
        r = httpx.post(url, json=payload, timeout=180)
        r.raise_for_status()
        data = r.json()
        print(f"  ✅  sequence (first 40 AA): {data['sequence'][:40]}...")
        print(f"  ✅  pdb_url: {data['pdb_url']}")
    except Exception as e:
        print(f"  ❌  Endpoint test failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--step",
        choices=["sequence", "esmfold", "endpoint", "all"],
        default="all",
    )
    args = parser.parse_args()

    if args.step in ("sequence", "all"):
        test_sequence_cleaning()

    if args.step in ("esmfold", "all"):
        test_esmfold()

    if args.step == "endpoint":
        test_endpoint()

    print("\nDone.")