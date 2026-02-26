import httpx
import uuid
from typing import Any, Dict, Optional
from app.db.session import SessionLocal
from app.models.subscription import Setting

class Aria2Downloader:
    async def add_magnet(self, magnet_link: str) -> Optional[str]:
        """Submit a magnet link to Aria2 via dynamic settings."""
        db = SessionLocal()
        try:
            # Fetch latest settings from DB
            rpc_url = db.query(Setting).filter(Setting.key == "aria2_rpc_url").first().value
            rpc_secret = db.query(Setting).filter(Setting.key == "aria2_rpc_secret").first().value
            
            payload = {
                "jsonrpc": "2.0",
                "id": str(uuid.uuid4()),
                "method": "aria2.addUri",
                "params": [[magnet_link]]
            }
            
            if rpc_secret:
                payload["params"].insert(0, f"token:{rpc_secret}")
                
            async with httpx.AsyncClient() as client:
                response = await client.post(rpc_url, json=payload, timeout=10.0)
                result = response.json()
                
                if "error" in result:
                    print(f"Aria2 error: {result['error']['message']}")
                    return None
                    
                return result.get("result")
                
        except Exception as e:
            print(f"Error connecting to Aria2: {e}")
            return None
        finally:
            db.close()

downloader = Aria2Downloader()
