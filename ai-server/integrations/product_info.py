import aiohttp
from typing import Optional, Dict, Any

class ProductInfoFetcher:
    def __init__(self, base_url: str, search_url: str):
        self.base_url = base_url
        self.search_url = search_url

    async def get_nutrition(self, food_name: str) -> Optional[Dict[str, Any]]:
        try:
            from .product_search import ProductSearchFetcher
            searcher = ProductSearchFetcher(self.base_url, self.search_url)
            search_results = await searcher.search_foods(food_name, 1)
            if not search_results:
                return None
            food_item = search_results[0]
            product_id = food_item.get("code")
            if not product_id:
                return None
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/product/{product_id}",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get("status") == 1:
                            product = result.get("product", {})
                            nutriments = product.get("nutriments", {})
                            return {
                                "quantity": 100,
                                "unit": "g",
                                "calories": nutriments.get("energy-kcal_100g", 0),
                                "protein": nutriments.get("proteins_100g", 0),
                                "fat": nutriments.get("fat_100g", 0),
                                "carbohydrate": nutriments.get("carbohydrates_100g", 0),
                                "water": 0,
                                "fiber": nutriments.get("fiber_100g", 0),
                                "sugar": nutriments.get("sugars_100g", 0),
                                "sodium": nutriments.get("salt_100g", 0) * 400,
                                "salt": nutriments.get("salt_100g", 0),
                                "brand": product.get("brands", ""),
                                "product_name": product.get("product_name", food_name),
                                "image_url": product.get("image_front_url", ""),
                                "ingredients": product.get("ingredients_text", ""),
                                "allergens": product.get("allergens_tags", []),
                                "nutrition_grade": product.get("nutrition_grade_fr", ""),
                                "nova_group": product.get("nova_group", ""),
                                "ecoscore": product.get("ecoscore_grade", "")
                            }
                    elif response.status == 429:
                        print("Open Food Facts API limit yetdi")
                        return None
                    else:
                        print(f"Open Food Facts API xatoligi: {response.status}")
                        return None
        except Exception as e:
            print(f"Open Food Facts API xatoligi: {e}")
            return None 