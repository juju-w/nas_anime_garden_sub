from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.subscription import Subscription, Filter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FilterBase(BaseModel):
    keyword: str
    type: str

class SubscriptionCreate(BaseModel):
    name: str
    url: str
    download_history: bool = False  # Default: only track future updates
    filters: List[FilterBase] = []

class SubscriptionResponse(BaseModel):
    id: int
    name: str
    url: str
    is_active: bool
    download_history: bool
    last_checked_at: Optional[datetime]
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[SubscriptionResponse])
def read_subscriptions(db: Session = Depends(get_db)) -> Any:
    return db.query(Subscription).all()

@router.post("/", response_model=SubscriptionResponse)
def create_subscription(*, db: Session = Depends(get_db), sub_in: SubscriptionCreate) -> Any:
    subscription = Subscription(
        name=sub_in.name, 
        url=sub_in.url, 
        download_history=sub_in.download_history
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    for f in sub_in.filters:
        db_filter = Filter(subscription_id=subscription.id, keyword=f.keyword, type=f.type)
        db.add(db_filter)
    
    db.commit()
    db.refresh(subscription)
    return subscription

@router.delete("/{sub_id}")
def delete_subscription(sub_id: int, db: Session = Depends(get_db)) -> Any:
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(sub)
    db.commit()
    return {"message": "Subscription deleted successfully"}
