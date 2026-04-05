from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env path relative to this file (backend/.env)
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "your-secret-key-for-jwt" # Пожалуйста, обновите на Render
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    TELEGRAM_BOT_TOKEN: str = "" # Обновите на Render

    model_config = SettingsConfigDict(env_file=str(ENV_FILE), extra="ignore")

settings = Settings()
