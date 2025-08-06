from pydantic import BaseModel

class Plan(BaseModel):
    user_id: int
    date: str
    calories: float
    protein: float
    fat: float
    carbs: float
    water: float
    goal: str 