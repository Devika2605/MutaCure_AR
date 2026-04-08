"""
generator.py — Fetches protein sequence from UniProt and applies known
disease-causing missense mutations before folding.

Person 2 owns this file.
"""

import re
import logging
import httpx

logger = logging.getLogger(__name__)

UNIPROT_SEARCH_URL = "https://rest.uniprot.org/uniprotkb/search"
REQUEST_TIMEOUT = 30
_AA = set("ACDEFGHIKLMNPQRSTVWY")

DISEASE_MUTATIONS = {
    "PPARG": [
        (115, "P", "Q", "P115Q - impairs ligand binding domain, T2D-linked"),
        (425, "L", "P", "L425P - disrupts helix 10, dominant negative"),
    ],
    "BRCA1": [
        (1699, "R", "W", "R1699W - BRCT domain, disrupts tumor suppressor"),
    ],
    "EGFR": [
        (858, "L", "R", "L858R - activating mutation, drives lung cancer"),
    ],
    "APOE": [
        (112, "C", "R", "C112R - APOE3 to APOE4 conversion, Alzheimers risk"),
    ],
}

_FALLBACK_SEQUENCES = {
    "PPARG":  "MGETLGDSPIDPESDSFTDTLSANISQEMTMVDTEMFFWPNLALQIEDPPAVHFPEGAPGRGSKFSSQRPSTIPPHSSTHPLVGRP",
    "BRCA1":  "MDLSALRVEEVQNVINAMQKILECPICLELIKEPVSTKCDHIFCKFCMLKLLNQKKGPSQCPLCKNDITKRSLQESTRFSQLVEELLK",
    "EGFR":   "MRPSGTAGAALLALLAALCPASRALEEKKVCQGTSNKLTQLGTFEDHFLSLQRMFNNCEVVLGNLEITYVQRNYDLSFLKTIQEVAGY",
    "APOE":   "MKVLWAALLVTFLAGCQAKVEQAVETEPEPELRQQTEWQSGQRWELALGRFWDYLRWVQTLSEQVQEELLSSQVTQELRALMDETMK",
}


def generate_protein_sequence(
    target_protein: str,
    seed_sequence: str = "",
    max_length: int = 200,
    apply_mutation: bool = True,
    **kwargs,
) -> dict:
    logger.info(f"Fetching sequence for {target_protein} from UniProt...")

    try:
        wildtype = _fetch_from_uniprot(target_protein)
    except Exception as exc:
        logger.warning(f"UniProt fetch failed ({exc}), using fallback.")
        wildtype = _get_fallback(target_protein)

    wildtype = wildtype[:max_length]

    if apply_mutation and target_protein.upper() in DISEASE_MUTATIONS:
        mutated, positions, info = _apply_mutations(
            wildtype, DISEASE_MUTATIONS[target_protein.upper()]
        )
        logger.info(f"Applied mutation: {info}")
    else:
        mutated = wildtype
        positions = []
        info = "No mutation applied (wild-type)"

    logger.info(f"Sequence ready - {len(mutated)} AA, {len(positions)} mutation site(s)")

    return {
        "sequence": mutated,
        "wildtype": wildtype,
        "mutation_info": info,
        "mutated_positions": positions,
    }


def _apply_mutations(sequence: str, mutations: list) -> tuple:
    seq = list(sequence)
    applied = []
    positions = []

    for pos_1based, wt_aa, mut_aa, description in mutations:
        idx = pos_1based - 1
        if idx >= len(seq):
            logger.warning(f"Mutation at pos {pos_1based} outside length {len(seq)}, skipping.")
            continue
        seq[idx] = mut_aa
        applied.append(description)
        positions.append(idx)

    info = " | ".join(applied) if applied else "No mutations in range"
    return "".join(seq), positions, info


def _fetch_from_uniprot(protein_name: str) -> str:
    params = {
        "query": f"gene:{protein_name} AND organism_id:9606 AND reviewed:true",
        "format": "fasta",
        "size": 1,
    }
    response = httpx.get(UNIPROT_SEARCH_URL, params=params, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    fasta = response.text
    if not fasta.strip():
        raise ValueError(f"No UniProt entry found for {protein_name}")
    return _parse_fasta(fasta)


def _parse_fasta(fasta: str) -> str:
    lines = fasta.strip().splitlines()
    seq_lines = [l for l in lines if not l.startswith(">")]
    raw = "".join(seq_lines).upper()
    return "".join(c for c in raw if c in _AA)


def _get_fallback(protein_name: str) -> str:
    return _FALLBACK_SEQUENCES.get(protein_name.upper(), "MKVLWAALLVTFLAGCQAK")


def _clean_sequence(raw: str) -> str:
    cleaned = re.sub(r"[^A-Za-z]", "", raw).upper()
    return "".join(c for c in cleaned if c in _AA)
