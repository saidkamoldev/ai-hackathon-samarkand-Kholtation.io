import os
import aiohttp
import asyncio
from typing import Optional, Dict, Any

class NutritionixAPI:
    """Nutritionix API integratsiyasi"""
    
    def __init__(self):
        self.app_id = os.getenv("NUTRITIONIX_APP_ID")
        self.app_key = os.getenv("NUTRITIONIX_APP_KEY")
        self.base_url = "https://trackapi.nutritionix.com/v2"
    
    async def get_nutrition(self, food_name: str) -> Optional[Dict[str, Any]]:
        """
        Oziq-ovqat ma'lumotlarini olish
        
        Args:
            food_name: Ovqat nomi
            
        Returns:
            Dict yoki None
        """
        if not self.app_id or not self.app_key:
            print("Nutritionix API credentials topilmadi")
            return None
        
        try:
            # Avval ovqatni qidirish
            search_results = await self.search_foods(food_name, 1)
            
            if not search_results:
                return None
            
            food_item = search_results[0]
            food_id = food_item.get("food_name")
            
            if not food_id:
                return None
            
            # Ma'lumotlarni olish
            async with aiohttp.ClientSession() as session:
                headers = {
                    "x-app-id": self.app_id,
                    "x-app-key": self.app_key,
                    "Content-Type": "application/json"
                }
                
                data = {
                    "query": food_name,
                    "timezone": "Asia/Tashkent"
                }
                
                async with session.post(
                    f"{self.base_url}/natural/nutrients",
                    json=data,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        
                        if result.get("foods") and len(result["foods"]) > 0:
                            food = result["foods"][0]
                            
                            return {
                                "quantity": food.get("serving_qty", 1),
                                "unit": food.get("serving_unit", "serving"),
                                "calories": food.get("nf_calories", 0),
                                "protein": food.get("nf_protein", 0),
                                "fat": food.get("nf_total_fat", 0),
                                "carbohydrate": food.get("nf_total_carbohydrate", 0),
                                "water": 0,  # Nutritionix da suv ma'lumoti yo'q
                                "fiber": food.get("nf_dietary_fiber", 0),
                                "sugar": food.get("nf_sugars", 0),
                                "sodium": food.get("nf_sodium", 0),
                                "cholesterol": food.get("nf_cholesterol", 0)
                            }
                    
                    elif response.status == 429:
                        print("Nutritionix API limit yetdi")
                        return None
                    else:
                        print(f"Nutritionix API xatoligi: {response.status}")
                        return None
                        
        except asyncio.TimeoutError:
            print("Nutritionix API timeout")
            return None
        except Exception as e:
            print(f"Nutritionix API xatoligi: {e}")
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
                headers = {
                    "x-app-id": self.app_id,
                    "x-app-key": self.app_key,
                    "Content-Type": "application/json"
                }
                
                data = {
                    "query": query,
                    "detailed": True,
                    "branded": True,
                    "common": True
                }
                
                async with session.post(
                    f"{self.base_url}/search/instant",
                    json=data,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        
                        # Common va branded ovqatlarni birlashtirish
                        foods = []
                        foods.extend(result.get("common", []))
                        foods.extend(result.get("branded", []))
                        
                        return foods[:max_results]
                    
                    return []
                    
        except Exception as e:
            print(f"Nutritionix qidiruv xatoligi: {e}")
            return []
    
    async def get_branded_food(self, food_id: str) -> Optional[Dict[str, Any]]:
        """
        Branded ovqat ma'lumotlarini olish
        
        Args:
            food_id: Ovqat ID si
            
        Returns:
            Dict yoki None
        """
        if not self.app_id or not self.app_key:
            return None
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "x-app-id": self.app_id,
                    "x-app-key": self.app_key
                }
                
                async with session.get(
                    f"{self.base_url}/search/item?nix_item_id={food_id}",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        return result.get("foods", [{}])[0]
                    
                    return None
                    
        except Exception as e:
            print(f"Nutritionix branded food xatoligi: {e}")
            return None
    
    def get_api_info(self) -> Dict[str, Any]:
        """API ma'lumotlari"""
        return {
            "name": "Nutritionix",
            "base_url": self.base_url,
            "has_credentials": bool(self.app_id and self.app_key),
            "features": [
                "calories",
                "protein",
                "fat",
                "carbohydrates",
                "fiber",
                "sugar",
                "sodium",
                "cholesterol",
                "branded_foods",
                "common_foods"
            ]
        }
