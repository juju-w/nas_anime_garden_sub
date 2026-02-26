from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.subscription import DownloadHistory
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class HistoryResponse(BaseModel):
    id: int
    subscription_id: int
    title: str
    magnet_link: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[HistoryResponse])
def read_history(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> Any:
    """Retrieve download history."""
    return db.query(DownloadHistory).order_by(DownloadHistory.created_at.desc()).offset(skip).limit(limit).all()

@router.delete("/clear")
def clear_history(db: Session = Depends(get_db)) -> Any:
    """Remove all history records."""
    db.query(DownloadHistory).delete()
    db.commit()
    return {"message": "History cleared successfully"}
