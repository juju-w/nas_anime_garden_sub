import httpx
import uuid
from typing import Any, Dict, Optional
from app.core.config import settings

class Aria2Downloader:
    def __init__(self):
        self.rpc_url = settings.ARIA2_RPC_URL
        self.rpc_secret = settings.ARIA2_RPC_SECRET

    async def add_magnet(self, magnet_link: str) -> Optional[str]:
        """Submit a magnet link to Aria2 via JSON-RPC."""
        payload = {
            "jsonrpc": "2.0",
            "id": str(uuid.uuid4()),
            "method": "aria2.addUri",
            "params": [[magnet_link]]
        }
        
        # Add secret if configured
        if self.rpc_secret:
            payload["params"].insert(0, f"token:{self.rpc_secret}")
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.rpc_url, json=payload, timeout=10.0)
                result = response.json()
                
                if "error" in result:
                    print(f"Aria2 error: {result['error']['message']}")
                    return None
                    
                return result.get("result")  # Returns GID
                
        except Exception as e:
            print(f"Error connecting to Aria2: {e}")
            return None

downloader = Aria2Downloader()
