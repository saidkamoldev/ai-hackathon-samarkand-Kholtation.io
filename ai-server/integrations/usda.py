import os
import aiohttp
import asyncio
from typing import Optional, Dict, Any

class USDAAPI:
    """USDA FoodData Central API integratsiyasi"""
    
    def __init__(self):
        self.api_key = os.getenv("USDA_API_KEY")
        self.base_url = "https://api.nal.usda.gov/fdc/v1"
    
    async def get_nutrition(self, food_name: str) -> Optional[Dict[str, Any]]:
        """
        Oziq-ovqat ma'lumotlarini olish
        
        Args:
            food_name: Ovqat nomi
            
        Returns:
            Dict yoki None
        """
        if not self.api_key:
            print("USDA API key topilmadi")
            return None
        
        try:
            # Avval ovqatni qidirish
            search_results = await self.search_foods(food_name, 1)
            
            if not search_results:
                return None
            
            food_item = search_results[0]
            food_id = food_item.get("fdcId")
            
            if not food_id:
                return None
            
            # Ma'lumotlarni olish
            async with aiohttp.ClientSession() as session:
                params = {
                    "api_key": self.api_key
                }
                
                async with session.get(
                    f"{self.base_url}/food/{food_id}",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        
                        # Nutritsiya ma'lumotlarini olish
                        nutrients = {}
                        for nutrient in result.get("foodNutrients", []):
                            nutrient_id = nutrient.get("nutrient", {}).get("id")
                            amount = nutrient.get("amount", 0)
                            
                            # USDA nutrient ID lari
                            if nutrient_id == 1008:  # Calories
                                nutrients["calories"] = amount
                            elif nutrient_id == 1003:  # Protein
                                nutrients["protein"] = amount
                            elif nutrient_id == 1004:  # Total Fat
                                nutrients["fat"] = amount
                            elif nutrient_id == 1005:  # Carbohydrate
                                nutrients["carbohydrate"] = amount
                            elif nutrient_id == 1051:  # Water
                                nutrients["water"] = amount
                            elif nutrient_id == 1079:  # Fiber
                                nutrients["fiber"] = amount
                            elif nutrient_id == 2000:  # Sugars
                                nutrients["sugar"] = amount
                            elif nutrient_id == 1093:  # Sodium
                                nutrients["sodium"] = amount
                        
                        return {
                            "quantity": 100,  # USDA 100g asosida
                            "unit": "g",
                            "calories": nutrients.get("calories", 0),
                            "protein": nutrients.get("protein", 0),
                            "fat": nutrients.get("fat", 0),
                            "carbohydrate": nutrients.get("carbohydrate", 0),
                            "water": nutrients.get("water", 0),
                            "fiber": nutrients.get("fiber", 0),
                            "sugar": nutrients.get("sugar", 0),
                            "sodium": nutrients.get("sodium", 0)
                        }
                    
                    elif response.status == 429:
                        print("USDA API limit yetdi")
                        return None
                    else:
                        print(f"USDA API xatoligi: {response.status}")
                        return None
                        
        except asyncio.TimeoutError:
            print("USDA API timeout")
            return None
        except Exception as e:
            print(f"USDA API xatoligi: {e}")
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
                    "api_key": self.api_key,
                    "query": query,
                    "pageSize": max_results,
                    "dataType": ["Foundation", "SR Legacy", "Survey (FNDDS)"]
                }
                
                async with session.get(
                    f"{self.base_url}/foods/search",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        foods = result.get("foods", [])
                        
                        return foods[:max_results]
                    
                    return []
                    
        except Exception as e:
            print(f"USDA qidiruv xatoligi: {e}")
            return []
    
    async def get_food_by_id(self, food_id: int) -> Optional[Dict[str, Any]]:
        """
        ID bo'yicha ovqat ma'lumotlarini olish
        
        Args:
            food_id: Ovqat ID si
            
        Returns:
            Dict yoki None
        """
        if not self.api_key:
            return None
        
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "api_key": self.api_key
                }
                
                async with session.get(
                    f"{self.base_url}/food/{food_id}",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        return result
                    
                    return None
                    
        except Exception as e:
            print(f"USDA food by ID xatoligi: {e}")
            return None
    
    async def get_food_categories(self) -> list:
        """
        Ovqat kategoriyalarini olish
        
        Returns:
            List of categories
        """
        if not self.api_key:
            return []
        
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "api_key": self.api_key
                }
                
                async with session.get(
                    f"{self.base_url}/food-categories",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        return result
                    
                    return []
                    
        except Exception as e:
            print(f"USDA categories xatoligi: {e}")
            return []
    
    def get_api_info(self) -> Dict[str, Any]:
        """API ma'lumotlari"""
        return {
            "name": "USDA FoodData Central",
            "base_url": self.base_url,
            "has_api_key": bool(self.api_key),
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
                "food_search",
                "food_categories",
                "government_data"
            ]
        }
