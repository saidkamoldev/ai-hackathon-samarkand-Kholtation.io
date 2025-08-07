import aiohttp
from typing import List

class CategoryFetcher:
    async def get_categories(self) -> List:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    "https://world.openfoodfacts.org/categories.json",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get("tags", [])
                    return []
        except Exception as e:
            print(f"Open Food Facts categories xatoligi: {e}")
            return [] 