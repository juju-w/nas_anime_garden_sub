from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base_class import Base
from app.models.subscription import Subscription, Filter, DownloadHistory, Setting
from app.core.config import settings

def init_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed default settings if empty
        if not db.query(Setting).filter(Setting.key == "aria2_rpc_url").first():
            db.add(Setting(key="aria2_rpc_url", value=settings.ARIA2_RPC_URL))
        if not db.query(Setting).filter(Setting.key == "aria2_rpc_secret").first():
            db.add(Setting(key="aria2_rpc_secret", value=settings.ARIA2_RPC_SECRET))
        db.commit()
    finally:
        db.close()
