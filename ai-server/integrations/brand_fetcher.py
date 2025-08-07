import aiohttp
from typing import List

class BrandFetcher:
    async def get_brands(self) -> List:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    "https://world.openfoodfacts.org/brands.json",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get("tags", [])
                    return []
        except Exception as e:
            print(f"Open Food Facts brands xatoligi: {e}")
            return [] 