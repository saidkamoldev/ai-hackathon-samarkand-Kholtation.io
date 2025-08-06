import os
import aiohttp
import asyncio
from typing import Optional, Dict, Any

class EdamamAPI:
    """Edamam API integratsiyasi"""
    
    def __init__(self):
        self.app_id = os.getenv("EDAMAM_APP_ID")
        self.app_key = os.getenv("EDAMAM_APP_KEY")
        self.base_url = "https://api.edamam.com/api"
    
    async def get_nutrition(self, food_name: str) -> Optional[Dict[str, Any]]:
        """
        Oziq-ovqat ma'lumotlarini olish
        
        Args:
            food_name: Ovqat nomi
            
        Returns:
            Dict yoki None
        """
        if not self.app_id or not self.app_key:
            print("Edamam API credentials topilmadi")
            return None
        
        try:
            # Avval ovqatni qidirish
            search_results = await self.search_foods(food_name, 1)
            
            if not search_results:
                return None
            
            food_item = search_results[0]
            food_id = food_item.get("uri", "").split("#")[-1]
            
            if not food_id:
                return None
            
            # Ma'lumotlarni olish
            async with aiohttp.ClientSession() as session:
                params = {
                    "app_id": self.app_id,
                    "app_key": self.app_key
                }
                
                async with session.get(
                    f"{self.base_url}/nutrition-data",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        
                        if result.get("ingredients") and len(result["ingredients"]) > 0:
                            ingredient = result["ingredients"][0]
                            nutrients = ingredient.get("parsed", [{}])[0].get("nutrients", {})
                            
                            return {
                                "quantity": ingredient.get("parsed", [{}])[0].get("quantity", 100),
                                "unit": ingredient.get("parsed", [{}])[0].get("measure", "g"),
                                "calories": nutrients.get("ENERC_KCAL", {}).get("quantity", 0),
                                "protein": nutrients.get("PROCNT", {}).get("quantity", 0),
                                "fat": nutrients.get("FAT", {}).get("quantity", 0),
                                "carbohydrate": nutrients.get("CHOCDF", {}).get("quantity", 0),
                                "water": nutrients.get("WATER", {}).get("quantity", 0),
                                "fiber": nutrients.get("FIBTG", {}).get("quantity", 0),
                                "sugar": nutrients.get("SUGAR", {}).get("quantity", 0),
                                "sodium": nutrients.get("NA", {}).get("quantity", 0)
                            }
                    
                    elif response.status == 429:
                        print("Edamam API limit yetdi")
                        return None
                    else:
                        print(f"Edamam API xatoligi: {response.status}")
                        return None
                        
        except asyncio.TimeoutError:
            print("Edamam API timeout")
            return None
        except Exception as e:
            print(f"Edamam API xatoligi: {e}")
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
        if not self.app_id or not self.app_key:
            return []
        
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "app_id": self.app_id,
                    "app_key": self.app_key,
                    "ingr": query,
                    "limit": max_results
                }
                
                async with session.get(
                    f"{self.base_url}/search",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        hits = result.get("hits", [])
                        
                        foods = []
                        for hit in hits:
                            food = hit.get("food", {})
                            foods.append({
                                "uri": food.get("uri"),
                                "label": food.get("label"),
                                "category": food.get("category"),
                                "foodId": food.get("foodId"),
                                "image": food.get("image")
                            })
                        
                        return foods
                    
                    return []
                    
        except Exception as e:
            print(f"Edamam qidiruv xatoligi: {e}")
            return []
    
    async def get_food_by_id(self, food_id: str) -> Optional[Dict[str, Any]]:
        """
        ID bo'yicha ovqat ma'lumotlarini olish
        
        Args:
            food_id: Ovqat ID si
            
        Returns:
            Dict yoki None
        """
        if not self.app_id or not self.app_key:
            return None
        
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "app_id": self.app_id,
                    "app_key": self.app_key
                }
                
                async with session.get(
                    f"{self.base_url}/food-database/v2/parser",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        return result
                    
                    return None
                    
        except Exception as e:
            print(f"Edamam food by ID xatoligi: {e}")
            return None
    
    def get_api_info(self) -> Dict[str, Any]:
        """API ma'lumotlari"""
        return {
            "name": "Edamam",
            "base_url": self.base_url,
            "has_credentials": bool(self.app_id and self.app_key),
            "features": [
                "calories",
                "protein",
                "fat",
                "carbohydrates",
                "water",
                "fiber",
                "sugar",
                "sodium",
                "detailed_nutrition",
                "food_search"
            ]
        }
