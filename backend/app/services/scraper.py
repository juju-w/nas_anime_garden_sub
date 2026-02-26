import feedparser
import httpx
import re
import asyncio
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.subscription import Subscription, DownloadHistory, Filter
from app.services.downloader import downloader
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

class RSSScraper:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0, limits=httpx.Limits(max_connections=5))
        self._executor = ThreadPoolExecutor(max_workers=3)

    async def fetch_and_process(self, db: Session, subscription: Subscription):
        """Fetch RSS and process efficiently with duplicate prevention."""
        try:
            response = await self.client.get(subscription.url)
            loop = asyncio.get_event_loop()
            feed = await loop.run_in_executor(self._executor, feedparser.parse, response.text)
            
            filters = db.query(Filter).filter(Filter.subscription_id == subscription.id).all()
            include_keywords = [f.keyword for f in filters if f.type == 'include']
            exclude_keywords = [f.keyword for f in filters if f.type == 'exclude']
            
            # Key logic: is this the absolute first time we see this subscription?
            is_new_tracker = subscription.last_checked_at is None
            new_items_processed = []

            for entry in feed.entries:
                title = entry.title
                magnet = self._extract_magnet(entry)
                if not magnet: continue
                
                # Check 1: Is it already in our DB? (If not cleared)
                if db.query(DownloadHistory.id).filter(DownloadHistory.magnet_link == magnet).first():
                    continue
                
                # Check 2: Matching keywords
                if self._should_download(title, include_keywords, exclude_keywords):
                    status = "skipped"
                    
                    # Logic for downloading:
                    # 1. If 'Archive Mode' is ON, we download everything we don't have in DB.
                    # 2. If 'Archive Mode' is OFF, we ONLY download if the tracker has already run before.
                    #    This prevents re-downloading old stuff after clearing history.
                    should_trigger_download = subscription.download_history or not is_new_tracker
                    
                    if should_trigger_download:
                        gid = await downloader.add_magnet(magnet)
                        status = "submitted" if gid else "failed"
                    
                    # Record so we don't process again
                    new_history = DownloadHistory(
                        subscription_id=subscription.id,
                        title=title,
                        magnet_link=magnet,
                        status=status
                    )
                    db.add(new_history)
                    new_items_processed.append(title)

            subscription.last_checked_at = datetime.utcnow()
            db.commit()
            
            if new_items_processed:
                print(f"[{subscription.name}] Processed {len(new_items_processed)} items (Action: {subscription.download_history})")
                
        except Exception as e:
            db.rollback()
            print(f"Scraper Error ({subscription.name}): {e}")

    def _extract_magnet(self, entry: Any) -> str:
        if hasattr(entry, 'link') and entry.link.startswith('magnet:'):
            return entry.link
        for link in getattr(entry, 'links', []):
            if link.get('href', '').startswith('magnet:'):
                return link['href']
        return ""

    def _should_download(self, title: str, include: List[str], exclude: List[str]) -> bool:
        for kw in exclude:
            if re.search(re.escape(kw), title, re.IGNORECASE):
                return False
        if not include:
            return True
        for kw in include:
            if re.search(re.escape(kw), title, re.IGNORECASE):
                return True
        return False

scraper = RSSScraper()
