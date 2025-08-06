from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

from integrations.calorieninjas import CalorieNinjasAPI
from integrations.nutritionix import NutritionixAPI
from integrations.edamam import EdamamAPI
from integrations.usda import USDAAPI
from llm.food_analyzer import FoodAnalyzer
from schemas.food import FoodAnalysisRequest, FoodAnalysisResponse, NutritionInfo

# Environment variables yuklash
load_dotenv()

app = FastAPI(
    title="Yogin.uz AI Server",
    description="Ovqat tahlili va kaloriya hisoblash uchun AI server",
    version="1.0.0"
)

# CORS sozlamalari
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API integratsiyalari
calorie_ninjas = CalorieNinjasAPI()
nutritionix = NutritionixAPI()
edamam = EdamamAPI()
usda = USDAAPI()

# LLM analyzer
food_analyzer = FoodAnalyzer()

@app.get("/")
async def root():
    return {"message": "Yogin.uz AI Server ishga tushdi"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": ["calorieninjas", "nutritionix", "edamam", "usda"]}

@app.post("/api/analyze-food", response_model=FoodAnalysisResponse)
async def analyze_food(request: FoodAnalysisRequest):
    """
    Ovqat matnini tahlil qilish va kaloriya hisoblash
    """
    try:
        # 1. LLM yordamida ovqatni aniqlash
        food_items = await food_analyzer.analyze_food_text(request.food_text)
        
        if not food_items:
            raise HTTPException(status_code=400, detail="Ovqat aniqlanmadi")
        
        # 2. Har bir ovqat uchun ma'lumotlarni olish
        nutrition_data = []
        total_calories = 0
        total_protein = 0
        total_fat = 0
        total_carbohydrate = 0
        total_water = 0
        
        for item in food_items:
            # Turli API lardan ma'lumot olish
            nutrition_info = await get_nutrition_info(item)
            
            if nutrition_info:
                nutrition_data.append(nutrition_info)
                total_calories += nutrition_info.calories
                total_protein += nutrition_info.protein
                total_fat += nutrition_info.fat
                total_carbohydrate += nutrition_info.carbohydrate
                total_water += nutrition_info.water
        
        return FoodAnalysisResponse(
            food_text=request.food_text,
            nutrition_items=nutrition_data,
            total_calories=total_calories,
            total_protein=total_protein,
            total_fat=total_fat,
            total_carbohydrate=total_carbohydrate,
            total_water=total_water,
            confidence=0.85  # AI ishonchliligi
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ovqat tahlilida xatolik: {str(e)}")

@app.get("/api/nutrition/{food_name}")
async def get_nutrition_info_endpoint(food_name: str):
    """
    Oziq-ovqat ma'lumotlarini olish
    """
    try:
        nutrition_info = await get_nutrition_info(food_name)
        if nutrition_info:
            return nutrition_info
        else:
            raise HTTPException(status_code=404, detail="Oziq-ovqat ma'lumotlari topilmadi")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ma'lumot olishda xatolik: {str(e)}")

async def get_nutrition_info(food_name: str) -> Optional[NutritionInfo]:
    """
    Turli API lardan oziq-ovqat ma'lumotlarini olish
    """
    # 1. CalorieNinjas dan urinish
    try:
        data = await calorie_ninjas.get_nutrition(food_name)
        if data:
            return NutritionInfo(
                food_name=food_name,
                quantity=data.get("quantity", 100),
                unit=data.get("unit", "g"),
                calories=data.get("calories", 0),
                protein=data.get("protein", 0),
                fat=data.get("fat", 0),
                carbohydrate=data.get("carbohydrate", 0),
                water=data.get("water", 0),
                confidence=0.9
            )
    except Exception as e:
        print(f"CalorieNinjas xatoligi: {e}")
    
    # 2. Nutritionix dan urinish
    try:
        data = await nutritionix.get_nutrition(food_name)
        if data:
            return NutritionInfo(
                food_name=food_name,
                quantity=data.get("quantity", 100),
                unit=data.get("unit", "g"),
                calories=data.get("calories", 0),
                protein=data.get("protein", 0),
                fat=data.get("fat", 0),
                carbohydrate=data.get("carbohydrate", 0),
                water=data.get("water", 0),
                confidence=0.85
            )
    except Exception as e:
        print(f"Nutritionix xatoligi: {e}")
    
    # 3. Edamam dan urinish
    try:
        data = await edamam.get_nutrition(food_name)
        if data:
            return NutritionInfo(
                food_name=food_name,
                quantity=data.get("quantity", 100),
                unit=data.get("unit", "g"),
                calories=data.get("calories", 0),
                protein=data.get("protein", 0),
                fat=data.get("fat", 0),
                carbohydrate=data.get("carbohydrate", 0),
                water=data.get("water", 0),
                confidence=0.8
            )
    except Exception as e:
        print(f"Edamam xatoligi: {e}")
    
    # 4. USDA dan urinish
    try:
        data = await usda.get_nutrition(food_name)
        if data:
            return NutritionInfo(
                food_name=food_name,
                quantity=data.get("quantity", 100),
                unit=data.get("unit", "g"),
                calories=data.get("calories", 0),
                protein=data.get("protein", 0),
                fat=data.get("fat", 0),
                carbohydrate=data.get("carbohydrate", 0),
                water=data.get("water", 0),
                confidence=0.75
            )
    except Exception as e:
        print(f"USDA xatoligi: {e}")
    
    return None

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
