from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    download_history = Column(Boolean, default=False)  # 是否下载现有历史条目
    last_checked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    filters = relationship("Filter", back_populates="subscription", cascade="all, delete-orphan")
    history = relationship("DownloadHistory", back_populates="subscription", cascade="all, delete-orphan")

class Filter(Base):
    __tablename__ = "filters"
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    keyword = Column(String)
    type = Column(String)  # 'include' or 'exclude'
    
    subscription = relationship("Subscription", back_populates="filters")

class DownloadHistory(Base):
    __tablename__ = "download_history"
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    title = Column(String)
    magnet_link = Column(String)
    status = Column(String, default="pending")  # pending, submitted, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    subscription = relationship("Subscription", back_populates="history")
