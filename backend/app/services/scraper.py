import feedparser
import httpx
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.subscription import Subscription, DownloadHistory, Filter
from app.services.downloader import downloader
from datetime import datetime

class RSSScraper:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def fetch_and_process(self, db: Session, subscription: Subscription):
        """Fetch RSS and process each entry based on filters."""
        try:
            response = await self.client.get(subscription.url)
            feed = feedparser.parse(response.text)
            
            # Fetch filters
            filters = db.query(Filter).filter(Filter.subscription_id == subscription.id).all()
            include_keywords = [f.keyword for f in filters if f.type == 'include']
            exclude_keywords = [f.keyword for f in filters if f.type == 'exclude']
            
            is_first_run = subscription.last_checked_at is None
            
            for entry in feed.entries:
                title = entry.title
                magnet = self._extract_magnet(entry)
                
                if not magnet:
                    continue
                
                # Check if already in history
                if db.query(DownloadHistory).filter(DownloadHistory.magnet_link == magnet).first():
                    continue
                
                # Filter matching
                if self._should_download(title, include_keywords, exclude_keywords):
                    # Logical check for history download
                    # If not download_history and first run, just mark as seen (by adding to history with status 'skipped')
                    if not subscription.download_history and is_first_run:
                        self._record_history(db, subscription.id, title, magnet, "skipped")
                    else:
                        # Real download
                        gid = await downloader.add_magnet(magnet)
                        status = "submitted" if gid else "failed"
                        self._record_history(db, subscription.id, title, magnet, status)
                        print(f"[{status.upper()}] {title}")

            # Update last checked timestamp
            subscription.last_checked_at = datetime.utcnow()
            db.commit()
            
        except Exception as e:
            print(f"Error processing {subscription.name}: {e}")

    def _record_history(self, db: Session, sub_id: int, title: str, magnet: str, status: str):
        history = DownloadHistory(
            subscription_id=sub_id,
            title=title,
            magnet_link=magnet,
            status=status
        )
        db.add(history)
        db.commit()

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
