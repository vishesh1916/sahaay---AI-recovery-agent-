from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    LLAMA_CLOUD_API_KEY: str = ""
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/sahaay"
    FALLBACK_DATABASE_URL: str = "sqlite+aiosqlite:///./sahaay.db"
    SECRET_KEY: str = "sahaay-hackathon-secret-key-2024"
    UPLOAD_DIR: str = "./uploads"
    PAYTM_MID: str = ""
    PAYTM_MERCHANT_KEY: str = ""
    PAYTM_CALLBACK_URL: str = "http://localhost:8000/payments/callback"
    CORS_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
