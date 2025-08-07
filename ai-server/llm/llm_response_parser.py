import json
from typing import List
from schemas.food import FoodItem

class LLMResponseParser:
    @staticmethod
    def parse_llm_response(content: str) -> List[FoodItem]:
        try:
            start = content.find('{')
            end = content.rfind('}') + 1
            if start == -1 or end == 0:
                return []
            json_str = content[start:end]
            data = json.loads(json_str)
            food_items = []
            for item in data.get("food_items", []):
                food_item = FoodItem(
                    name=item.get("name", ""),
                    quantity=float(item.get("quantity", 1)),
                    unit=item.get("unit", "dona"),
                    description=item.get("description", "")
                )
                food_items.append(food_item)
            return food_items
        except Exception as e:
            print(f"JSON parse xatoligi: {e}")
            return [] 