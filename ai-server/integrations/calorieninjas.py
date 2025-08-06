import os
import aiohttp
import asyncio
from typing import Optional, Dict, Any

class CalorieNinjasAPI:
    """CalorieNinjas API integratsiyasi"""
    
    def __init__(self):
        self.api_key = os.getenv("CALORIE_NINJAS_API_KEY")
        self.base_url = "https://api.calorieninjas.com/v1/nutrition"
    
    async def get_nutrition(self, food_name: str) -> Optional[Dict[str, Any]]:
        """
        Oziq-ovqat ma'lumotlarini olish
        
        Args:
            food_name: Ovqat nomi
            
        Returns:
            Dict yoki None
        """
        if not self.api_key:
            print("CalorieNinjas API key topilmadi")
            return None
        
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "query": food_name,
                    "max_age": 86400  # 24 soat cache
                }
                
                headers = {
                    "X-Api-Key": self.api_key
                }
                
                async with session.get(
                    self.base_url,
                    params=params,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get("items") and len(data["items"]) > 0:
                            item = data["items"][0]
                            
                            return {
                                "quantity": item.get("serving_size_g", 100),
                                "unit": "g",
                                "calories": item.get("calories", 0),
                                "protein": item.get("protein_g", 0),
                                "fat": item.get("fat_total_g", 0),
                                "carbohydrate": item.get("carbohydrates_total_g", 0),
                                "water": 0,  # CalorieNinjas da suv ma'lumoti yo'q
                                "fiber": item.get("fiber_g", 0),
                                "sugar": item.get("sugar_g", 0),
                                "sodium": item.get("sodium_mg", 0)
                            }
                    
                    elif response.status == 429:
                        print("CalorieNinjas API limit yetdi")
                        return None
                    else:
                        print(f"CalorieNinjas API xatoligi: {response.status}")
                        return None
                        
        except asyncio.TimeoutError:
            print("CalorieNinjas API timeout")
            return None
        except Exception as e:
            print(f"CalorieNinjas API xatoligi: {e}")
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
        if not self.api_key:
            return []
        
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "query": query,
                    "max_age": 86400
                }
                
                headers = {
                    "X-Api-Key": self.api_key
                }
                
                async with session.get(
                    self.base_url,
                    params=params,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        items = data.get("items", [])
                        
                        return items[:max_results]
                    
                    return []
                    
        except Exception as e:
            print(f"CalorieNinjas qidiruv xatoligi: {e}")
            return []
    
    def get_api_info(self) -> Dict[str, Any]:
        """API ma'lumotlari"""
        return {
            "name": "CalorieNinjas",
            "base_url": self.base_url,
            "has_api_key": bool(self.api_key),
            "features": [
                "calories",
                "protein",
                "fat",
                "carbohydrates",
                "fiber",
                "sugar",
                "sodium"
            ]
        }
