from pydantic import BaseModel
from typing import Optional, List

class FoodInput(BaseModel):
    text: str  # Masalan: "2 ta tuxum va bitta kofe ichdim"

class FoodItem(BaseModel):
    name: str
    amount: float
    unit: str
    calories: float
    protein: float
    fat: float
    carbs: float

class FoodOutput(BaseModel):
    items: List[FoodItem]
    total_calories: float
    total_protein: float
    total_fat: float
    total_carbs: float 