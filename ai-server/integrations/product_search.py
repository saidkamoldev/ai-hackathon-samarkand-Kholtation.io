import aiohttp
from typing import List, Dict, Any

class ProductSearchFetcher:
    def __init__(self, base_url: str, search_url: str):
        self.base_url = base_url
        self.search_url = search_url

    async def search_foods(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "search_terms": query,
                    "search_simple": 1,
                    "action": "process",
                    "json": 1,
                    "page_size": max_results,
                    "fields": "code,product_name,brands,nutrition_grade_fr,image_front_url"
                }
                async with session.get(
                    self.search_url,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        products = result.get("products", [])
                        return products[:max_results]
                    return []
        except Exception as e:
            print(f"Open Food Facts qidiruv xatoligi: {e}")
            return [] 