from pydantic import BaseModel
from typing import List, Optional

class NutritionInfo(BaseModel):
    """Oziq-ovqat ma'lumotlari"""
    food_name: str
    quantity: float
    unit: str
    calories: float
    protein: float
    fat: float
    carbohydrate: float
    water: float
    confidence: float

class FoodAnalysisRequest(BaseModel):
    """Ovqat tahlili uchun request"""
    food_text: str
    user_id: Optional[str] = None
    meal_type: Optional[str] = None

class FoodAnalysisResponse(BaseModel):
    """Ovqat tahlili natijasi"""
    food_text: str
    nutrition_items: List[NutritionInfo]
    total_calories: float
    total_protein: float
    total_fat: float
    total_carbohydrate: float
    total_water: float
    confidence: float

class FoodItem(BaseModel):
    """LLM tomonidan aniqlangan ovqat elementi"""
    name: str
    quantity: float
    unit: str
    description: Optional[str] = None

class APIResponse(BaseModel):
    """API response wrapper"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    message: Optional[str] = None 