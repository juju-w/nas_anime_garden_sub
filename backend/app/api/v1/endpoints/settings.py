from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.subscription import Setting
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def read_settings(db: Session = Depends(get_db)) -> Any:
    """Retrieve application settings from DB."""
    all_settings = db.query(Setting).all()
    return {s.key: s.value for s in all_settings}

@router.put("/")
def update_settings(data: Dict[str, str], db: Session = Depends(get_db)) -> Any:
    """Update application settings in DB."""
    for key, value in data.items():
        db_setting = db.query(Setting).filter(Setting.key == key).first()
        if db_setting:
            db_setting.value = value
        else:
            db.add(Setting(key=key, value=value))
    db.commit()
    return {"message": "Settings updated"}
