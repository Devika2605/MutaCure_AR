"""
shared/config.py — App-wide settings loaded from environment variables.
Uses plain os.environ to avoid pydantic-settings dependency issues.
Edit only with both teammates present.
"""

import os


class Settings:
    app_title: str = os.environ.get("APP_TITLE", "MutaCure AR API")
    app_version: str = os.environ.get("APP_VERSION", "0.1.0")
    debug: bool = os.environ.get("DEBUG", "false").lower() == "true"
    pdb_output_dir: str = os.environ.get("PDB_OUTPUT_DIR", "files")
    cors_origins: list = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:3000,https://*.vercel.app"
    ).split(",")


settings = Settings()