from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_SYSTEM_PROMPT = (
    "You are Fredbot, a friendly and concise personal AI assistant. "
    "Answer clearly, use Markdown when it helps readability, and say so when you don't know."
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FREDBOT_", env_file=".env", extra="ignore")

    app_name: str = "Fredbot"
    default_model: str = "openai/gpt-6-luna"
    system_prompt: str = DEFAULT_SYSTEM_PROMPT
    cors_origins: list[str] = ["http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    # LiteLLM reads provider credentials (OPENAI_API_KEY, AZURE_API_KEY, ...) from the environment.
    load_dotenv()
    return Settings()
