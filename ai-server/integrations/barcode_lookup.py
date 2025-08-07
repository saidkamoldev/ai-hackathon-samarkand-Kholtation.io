import aiohttp
from typing import Optional, Dict, Any

class BarcodeLookupFetcher:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def get_product_by_barcode(self, barcode: str) -> Optional[Dict[str, Any]]:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/product/{barcode}",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get("status") == 1:
                            return result.get("product", {})
                    return None
        except Exception as e:
            print(f"Open Food Facts barcode xatoligi: {e}")
            return None 