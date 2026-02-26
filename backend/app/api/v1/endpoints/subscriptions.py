from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.subscription import Subscription, Filter
from app.services.scraper import scraper
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper to run sync in background
async def run_sync(sub_id: int):
    db = SessionLocal()
    try:
        sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
        if sub and sub.is_active:
            print(f"Triggering immediate sync for: {sub.name}")
            await scraper.fetch_and_process(db, sub)
    finally:
        db.close()

class FilterBase(BaseModel):
    keyword: str
    type: str

class SubscriptionCreate(BaseModel):
    name: str
    url: str
    download_history: bool = False
    filters: List[FilterBase] = []

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    is_active: Optional[bool] = None
    download_history: Optional[bool] = None
    filters: Optional[List[FilterBase]] = None

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
async def create_subscription(
    *, 
    db: Session = Depends(get_db), 
    sub_in: SubscriptionCreate,
    background_tasks: BackgroundTasks
) -> Any:
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
    
    # Trigger immediate sync
    background_tasks.add_task(run_sync, subscription.id)
    
    return subscription

@router.patch("/{sub_id}", response_model=SubscriptionResponse)
async def update_subscription(
    sub_id: int, 
    sub_in: SubscriptionUpdate, 
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
) -> Any:
    db_sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not db_sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    update_data = sub_in.model_dump(exclude_unset=True)
    was_inactive = not db_sub.is_active
    
    for field in ["name", "url", "is_active", "download_history"]:
        if field in update_data:
            setattr(db_sub, field, update_data[field])
    
    if "filters" in update_data:
        db.query(Filter).filter(Filter.subscription_id == sub_id).delete()
        for f in update_data["filters"]:
            db_filter = Filter(subscription_id=sub_id, keyword=f.keyword, type=f.type)
            db.add(db_filter)
            
    db.commit()
    db.refresh(db_sub)
    
    # Trigger sync if it was turned on or if details were changed
    if db_sub.is_active and (was_inactive or "url" in update_data or "filters" in update_data):
        if background_tasks:
            background_tasks.add_task(run_sync, db_sub.id)
            
    return db_sub

@router.delete("/{sub_id}")
def delete_subscription(sub_id: int, db: Session = Depends(get_db)) -> Any:
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(sub)
    db.commit()
    return {"message": "Subscription deleted successfully"}
