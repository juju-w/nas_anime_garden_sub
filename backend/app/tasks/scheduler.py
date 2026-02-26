from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.subscription import Subscription
from app.services.scraper import scraper

class TaskScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        
    def start(self):
        """Add jobs and start the scheduler."""
        # Check feeds every 10 minutes
        self.scheduler.add_job(self.check_all_feeds, 'interval', minutes=10)
        self.scheduler.start()

    async def check_all_feeds(self):
        """Query active subscriptions and process them."""
        db = SessionLocal()
        try:
            active_subs = db.query(Subscription).filter(Subscription.is_active == True).all()
            for sub in active_subs:
                print(f"Checking feed: {sub.name}")
                await scraper.fetch_and_process(db, sub)
        finally:
            db.close()

task_scheduler = TaskScheduler()
