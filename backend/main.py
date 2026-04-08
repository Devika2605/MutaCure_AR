"""
main.py — FastAPI app entry point.
Frozen after Day 1 setup. Edit only with both teammates present.
"""

import os
import sys
import logging

# ---------------------------------------------------------------------------
# Ensure the backend/ directory is on sys.path.
# Required on Windows when uvicorn spawns a subprocess (the CWD is not
# automatically added to sys.path in that context).
# ---------------------------------------------------------------------------
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

# CORS — allows the Next.js frontend and AR page to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static files — PDB files served at /files/<filename>.pdb
# ---------------------------------------------------------------------------

os.makedirs(settings.pdb_output_dir, exist_ok=True)
app.mount("/files", StaticFiles(directory=settings.pdb_output_dir), name="files")

# ---------------------------------------------------------------------------
# Routers — imported AFTER app is created to avoid NameError on Windows
# (uvicorn's subprocess spawner re-executes this module from scratch)
# ---------------------------------------------------------------------------

from protein.routes import router as protein_router  # noqa: E402
app.include_router(protein_router)

# Person 1 uncomments both lines below on Day 1 sync:
# from mutation.routes import router as mutation_router
# app.include_router(mutation_router)


# ---------------------------------------------------------------------------
# Root health check
# ---------------------------------------------------------------------------

@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "project": "MutaCure AR"}