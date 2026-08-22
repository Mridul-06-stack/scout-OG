"""Scout Core Configuration — loads .env and provides typed settings."""

from __future__ import annotations

import os
from pathlib import Path
from functools import lru_cache

from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from backend root
_backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(_backend_dir / ".env")


class Settings(BaseSettings):
    """Typed, cached application settings sourced from env vars."""

    # --- LLM ---
    llm_provider: str = "auto"  # "auto", "openai", "anthropic"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    anthropic_api_key: str = ""
    llm_model: str = "claude-haiku-4-5-20250901"

    # --- webcmd ---
    webcmd_mode: str = "mock"  # "mock" or "real"
    webcmd_api_key: str = ""
    webcmd_explore_timeout: int = 60
    webcmd_execute_timeout: int = 30

    # --- Approval Gate ---
    approval_timeout_seconds: int = 300
    approval_demo_mode: bool = False

    # --- Database ---
    database_url: str = "sqlite+aiosqlite:///./scout.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
