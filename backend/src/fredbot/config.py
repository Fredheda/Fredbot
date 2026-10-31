from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FREDBOT_", env_file=".env", extra="ignore")

    app_name: str = "Fredbot"
    openai_api_key: SecretStr | None = None
    default_model: str = "gpt-4o-mini"
    cors_origins: list[str] = ["http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
