from typing import List
import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "Identity Capsule API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",  # Frontend development server
        "http://localhost:8000",  # Backend development server
    ]
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "development_secret_key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Storage Settings
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")
    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "/tmp/identity_capsule_storage")
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./identity_capsule.db"
    
    class Config:
        frozen = True

settings = Settings()
