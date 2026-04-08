"""
main.py — FastAPI app entry point.
Merged version (Day 1 sync complete)
"""

import os
import sys
import logging

# Ensure backend path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from shared.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.app_title,
    version=settings.app_version,
    debug=settings.debug,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static files (for PDB)
# ---------------------------------------------------------------------------

os.makedirs(settings.pdb_output_dir, exist_ok=True)
app.mount("/files", StaticFiles(directory=settings.pdb_output_dir), name="files")

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

from protein.routes import router as protein_router
from mutation.routes import router as mutation_router

app.include_router(protein_router)
app.include_router(mutation_router, prefix="/api")

# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

@app.get("/", tags=["health"])
async def root():
    return {
        "status": "ok",
        "project": "MutaCure AR",
        "message": "API running 🚀"
    }