import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NAS Anime Garden Subscription"
    API_V1_STR: str = "/api/v1"
    
    # SQLite Database
    SQLALCHEMY_DATABASE_URI: str = os.getenv(
        "DATABASE_URL", "sqlite:///./data/nas_anime.db"
    )
    
    # Aria2 Settings
    ARIA2_RPC_URL: str = os.getenv("ARIA2_RPC_URL", "http://localhost:6800/jsonrpc")
    ARIA2_RPC_SECRET: str = os.getenv("ARIA2_RPC_SECRET", "")
    
    class Config:
        case_sensitive = True

settings = Settings()
