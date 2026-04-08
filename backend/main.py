# ============================================================
# MutaCure AR — main.py (FastAPI Entry Point)
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mutation.routes import router as mutation_router

app = FastAPI(
    title="MutaCure AR API",
    description="Mutation → Therapy → AR Pipeline",
    version="1.0.0"
)

# CORS (for frontend/AR later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register mutation routes
app.include_router(mutation_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "MutaCure AR API is running 🚀"}