from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    groq_api_key: str = ""                          # GROQ_API_KEY — AI chat / playground (never commit)
    groq_model: str = "llama-3.3-70b-versatile"     # GROQ_MODEL — Groq Llama 3.3 70B default
    ollama_url: str = "http://ollama:11434"         # Docker service name
    qdrant_url: str = "http://qdrant:6333"          # Docker service name
    cors_origins: str = "http://localhost:5173,http://localhost:8080"
    docs_starter_path: str = "data/docs/starter"
    docs_generated_path: str = "data/docs/generated"
    sessions_path: str = "data/sessions"
    hf_cache_dir: str = "/root/.cache/huggingface"
    log_level: str = "INFO"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
