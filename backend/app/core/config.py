from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ─── Database ──────────────────────────────────────────
    DATABASE_URL: str

    # ─── Authentication ────────────────────────────────────
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ─── Deployment ────────────────────────────────────────
    ENVIRONMENT: str = "development"

    # Comma-separated list of allowed browser origins, e.g.
    #   CORS_ORIGINS=https://raktaseva.lk,https://www.raktaseva.lk
    CORS_ORIGINS: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


settings = Settings()

# A default secret in production would let anyone forge a login token, so fail
# loudly at startup rather than quietly serving an insecure API.
if settings.is_production:
    if "change-in-production" in settings.JWT_SECRET or len(settings.JWT_SECRET) < 32:
        raise RuntimeError(
            "Refusing to start: JWT_SECRET is a default or too short. "
            "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )
