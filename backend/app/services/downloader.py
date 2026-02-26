import httpx
import uuid
import asyncio
from typing import Any, Dict, Optional
from app.db.session import SessionLocal
from app.models.subscription import Setting

class Aria2Downloader:
    def __init__(self):
        self._client = httpx.AsyncClient(timeout=10.0, limits=httpx.Limits(max_connections=10))
        self._config_cache = None

    async def get_config(self):
        if self._config_cache:
            return self._config_cache
        
        db = SessionLocal()
        try:
            url = db.query(Setting).filter(Setting.key == "aria2_rpc_url").first()
            secret = db.query(Setting).filter(Setting.key == "aria2_rpc_secret").first()
            self._config_cache = {
                "url": url.value if url else "",
                "secret": secret.value if secret else ""
            }
            return self._config_cache
        finally:
            db.close()

    def clear_cache(self):
        self._config_cache = None

    async def add_magnet(self, magnet_link: str) -> Optional[str]:
        config = await self.get_config()
        if not config["url"]:
            return None

        payload = {
            "jsonrpc": "2.0",
            "id": str(uuid.uuid4()),
            "method": "aria2.addUri",
            "params": [[magnet_link]]
        }
        
        if config["secret"]:
            payload["params"].insert(0, f"token:{config['secret']}")
            
        try:
            response = await self._client.post(config["url"], json=payload)
            result = response.json()
            return result.get("result") if "error" not in result else None
        except Exception as e:
            print(f"Downloader Error: {e}")
            return None

downloader = Aria2Downloader()
