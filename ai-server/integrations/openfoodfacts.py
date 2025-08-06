import os
import aiohttp
import asyncio
from typing import Optional, Dict, Any

class OpenFoodFactsAPI:
    """Open Food Facts API integratsiyasi"""
    
    def __init__(self):
        self.base_url = "https://world.openfoodfacts.org/api/v2"
        self.search_url = "https://world.openfoodfacts.org/cgi/search.pl"
    
    async def get_nutrition(self, food_name: str) -> Optional[Dict[str, Any]]:
        """
        Oziq-ovqat ma'lumotlarini olish
        
        Args:
            food_name: Ovqat nomi
            
        Returns:
            Dict yoki None
        """
        try:
            # Avval ovqatni qidirish
            search_results = await self.search_foods(food_name, 1)
            
            if not search_results:
                return None
            
            food_item = search_results[0]
            product_id = food_item.get("code")
            
            if not product_id:
                return None
            
            # Ma'lumotlarni olish
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
                                "quantity": 100,  # Open Food Facts 100g asosida
                                "unit": "g",
                                "calories": nutriments.get("energy-kcal_100g", 0),
                                "protein": nutriments.get("proteins_100g", 0),
                                "fat": nutriments.get("fat_100g", 0),
                                "carbohydrate": nutriments.get("carbohydrates_100g", 0),
                                "water": 0,  # Open Food Facts da suv ma'lumoti kam
                                "fiber": nutriments.get("fiber_100g", 0),
                                "sugar": nutriments.get("sugars_100g", 0),
                                "sodium": nutriments.get("salt_100g", 0) * 400,  # tuz -> natriy
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
                        
        except asyncio.TimeoutError:
            print("Open Food Facts API timeout")
            return None
        except Exception as e:
            print(f"Open Food Facts API xatoligi: {e}")
            return None
    
    async def search_foods(self, query: str, max_results: int = 5) -> list:
        """
        Ovqatlar qidirish
        
        Args:
            query: Qidiruv so'zi
            max_results: Maksimal natija soni
            
        Returns:
            List of food items
        """
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
    
    async def get_product_by_barcode(self, barcode: str) -> Optional[Dict[str, Any]]:
        """
        Barkod bo'yicha mahsulot ma'lumotlarini olish
        
        Args:
            barcode: Mahsulot barkodi
            
        Returns:
            Dict yoki None
        """
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
    
    async def get_categories(self) -> list:
        """
        Ovqat kategoriyalarini olish
        
        Returns:
            List of categories
        """
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
    
    async def get_brands(self) -> list:
        """
        Brendlar ro'yxatini olish
        
        Returns:
            List of brands
        """
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
    
    def get_api_info(self) -> Dict[str, Any]:
        """API ma'lumotlari"""
        return {
            "name": "Open Food Facts",
            "base_url": self.base_url,
            "has_api_key": False,  # Bepul API
            "features": [
                "calories",
                "protein",
                "fat",
                "carbohydrates",
                "fiber",
                "sugar",
                "sodium",
                "salt",
                "detailed_nutrition",
                "food_search",
                "barcode_scanning",
                "brands",
                "categories",
                "ingredients",
                "allergens",
                "nutrition_grade",
                "nova_group",
                "ecoscore",
                "product_images",
                "free_api"
            ]
        } 