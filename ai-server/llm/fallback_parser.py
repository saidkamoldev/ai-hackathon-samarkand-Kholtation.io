from typing import List
from schemas.food import FoodItem

class FallbackParser:
    @staticmethod
    def fallback_parsing(food_text: str) -> List[FoodItem]:
        food_items = []
        common_foods = {
            "tuxum": {"unit": "dona", "description": "tavla tuxum"},
            "kofe": {"unit": "stakan", "description": "qora kofe"},
            "choy": {"unit": "stakan", "description": "qora choy"},
            "non": {"unit": "dona", "description": "tandir non"},
            "sut": {"unit": "stakan", "description": "sut"},
            "yogurt": {"unit": "stakan", "description": "yogurt"},
            "olma": {"unit": "dona", "description": "olma"},
            "banan": {"unit": "dona", "description": "banan"},
            "guruch": {"unit": "stakan", "description": "guruch"},
            "go'sht": {"unit": "gram", "description": "qizil go'sht"},
            "baliq": {"unit": "gram", "description": "baliq"},
            "tovuq": {"unit": "gram", "description": "tovuq go'shti"},
            "pishloq": {"unit": "gram", "description": "pishloq"},
            "yogurt": {"unit": "gram", "description": "yogurt"},
            "sariyog": {"unit": "gram", "description": "sariyog"},
            "kartoshka": {"unit": "gram", "description": "kartoshka"},
            "sabzi": {"unit": "gram", "description": "sabzi"},
            "pomidor": {"unit": "dona", "description": "pomidor"},
            "bodring": {"unit": "dona", "description": "bodring"},
            "piyoz": {"unit": "dona", "description": "piyoz"},
            "sarimsoq": {"unit": "dona", "description": "sarimsoq"},
            "limon": {"unit": "dona", "description": "limon"},
            "apelsin": {"unit": "dona", "description": "apelsin"},
            "uzum": {"unit": "gram", "description": "uzum"},
            "qulupnay": {"unit": "gram", "description": "qulupnay"},
            "shaftoli": {"unit": "dona", "description": "shaftoli"},
            "o'rik": {"unit": "dona", "description": "o'rik"},
            "qovun": {"unit": "gram", "description": "qovun"},
            "tarvuz": {"unit": "gram", "description": "tarvuz"},
        }
        text_lower = food_text.lower()
        for food_name, food_info in common_foods.items():
            if food_name in text_lower:
                quantity = 1
                if "2" in text_lower or "ikki" in text_lower:
                    quantity = 2
                elif "3" in text_lower or "uch" in text_lower:
                    quantity = 3
                elif "4" in text_lower or "to'rt" in text_lower:
                    quantity = 4
                elif "5" in text_lower or "besh" in text_lower:
                    quantity = 5
                elif "6" in text_lower or "olti" in text_lower:
                    quantity = 6
                elif "7" in text_lower or "yetti" in text_lower:
                    quantity = 7
                elif "8" in text_lower or "sakkiz" in text_lower:
                    quantity = 8
                elif "9" in text_lower or "to'qqiz" in text_lower:
                    quantity = 9
                elif "10" in text_lower or "o'n" in text_lower:
                    quantity = 10
                food_item = FoodItem(
                    name=food_name,
                    quantity=quantity,
                    unit=food_info["unit"],
                    description=food_info["description"]
                )
                food_items.append(food_item)
        return food_items 