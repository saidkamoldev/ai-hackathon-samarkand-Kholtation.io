from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: Optional[int]
    name: str
    email: str
    age: int
    height: float
    weight: float
    gender: str
    activity: str
    goal: str 