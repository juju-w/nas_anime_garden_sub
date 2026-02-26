from typing import Any, Dict
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/")
def read_settings() -> Any:
    """Retrieve application settings."""
    return {
        "aria2_rpc_url": settings.ARIA2_RPC_URL,
        "aria2_rpc_secret": settings.ARIA2_RPC_SECRET,
        "database_url": settings.SQLALCHEMY_DATABASE_URI,
    }

@router.put("/")
def update_settings(data: Dict[str, Any]) -> Any:
    """Update application settings."""
    # In a real app, you would persist these settings to the database
    # For now, we return what was sent
    return data
