from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GOOGLE_CLIENT_ID: str = ""
    JWT_SECRET_KEY: str = "change-this-secret"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    DATABASE_URL: str = "sqlite:///./app.db"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
