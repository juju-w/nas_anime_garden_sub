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
        """Fetch RSS and process efficiently."""
        try:
            response = await self.client.get(subscription.url)
            
            # Offload CPU-bound parsing to thread pool to keep event loop responsive
            loop = asyncio.get_event_loop()
            feed = await loop.run_in_executor(self._executor, feedparser.parse, response.text)
            
            filters = db.query(Filter).filter(Filter.subscription_id == subscription.id).all()
            include_keywords = [f.keyword for f in filters if f.type == 'include']
            exclude_keywords = [f.keyword for f in filters if f.type == 'exclude']
            
            is_first_run = subscription.last_checked_at is None
            new_items = []

            for entry in feed.entries:
                title = entry.title
                magnet = self._extract_magnet(entry)
                if not magnet: continue
                
                # Use a fast check first
                if db.query(DownloadHistory.id).filter(DownloadHistory.magnet_link == magnet).first():
                    continue
                
                if self._should_download(title, include_keywords, exclude_keywords):
                    status = "skipped"
                    if subscription.download_history or not is_first_run:
                        gid = await downloader.add_magnet(magnet)
                        status = "submitted" if gid else "failed"
                    
                    # Batch records instead of individual commits
                    new_history = DownloadHistory(
                        subscription_id=subscription.id,
                        title=title,
                        magnet_link=magnet,
                        status=status
                    )
                    db.add(new_history)
                    new_items.append(title)

            subscription.last_checked_at = datetime.utcnow()
            db.commit() # Single commit per feed
            
            if new_items:
                print(f"[{subscription.name}] Processed {len(new_items)} new items.")
                
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
