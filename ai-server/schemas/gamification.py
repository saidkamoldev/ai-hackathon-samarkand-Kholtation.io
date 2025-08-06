from pydantic import BaseModel
from typing import Optional

class Badge(BaseModel):
    user_id: int
    name: str
    description: str
    date_earned: Optional[str]

class Progress(BaseModel):
    user_id: int
    date: str
    streak: int
    points: int 