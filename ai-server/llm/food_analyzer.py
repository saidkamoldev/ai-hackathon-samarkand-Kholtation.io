import os
import json
from typing import List, Optional
from openai import AsyncOpenAI
from schemas.food import FoodItem

class FoodAnalyzer:
    """LLM yordamida ovqat matnini tahlil qilish"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-3.5-turbo"
    
    async def analyze_food_text(self, food_text: str) -> List[FoodItem]:
        """
        Ovqat matnini tahlil qilish va ovqat elementlarini aniqlash
        
        Args:
            food_text: "2 ta tuxum va bitta kofe ichdim"
            
        Returns:
            List[FoodItem]: Aniqlangan ovqat elementlari
        """
        try:
            prompt = self._create_analysis_prompt(food_text)
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Siz ovqat matnini tahlil qiluvchi AI assistantsiz. Foydalanuvchi kiritgan matndan ovqat elementlarini aniqlab, JSON formatda qaytaring."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            food_items = self._parse_llm_response(content)
            
            return food_items
            
        except Exception as e:
            print(f"LLM tahlilida xatolik: {e}")
            # Fallback: oddiy parsing
            return self._fallback_parsing(food_text)
    
    def _create_analysis_prompt(self, food_text: str) -> str:
        """LLM uchun prompt yaratish"""
        return f"""
Quyidagi ovqat matnini tahlil qiling va har bir ovqat elementi uchun ma'lumotlarni JSON formatda qaytaring:

Matn: "{food_text}"

Qaytaring JSON formatda:
{{
    "food_items": [
        {{
            "name": "ovqat nomi",
            "quantity": miqdori (raqam),
            "unit": "o'lchov birligi (gram, dona, stakan, va h.k.)",
            "description": "qisqacha tavsif"
        }}
    ]
}}

Misol:
Matn: "2 ta tuxum va bitta kofe ichdim"
{{
    "food_items": [
        {{
            "name": "tuxum",
            "quantity": 2,
            "unit": "dona",
            "description": "tavla tuxum"
        }},
        {{
            "name": "kofe",
            "quantity": 1,
            "unit": "stakan",
            "description": "qora kofe"
        }}
    ]
}}

Faqat JSON qaytaring, boshqa matn yo'q.
"""
    
    def _parse_llm_response(self, content: str) -> List[FoodItem]:
        """LLM response ni parse qilish"""
        try:
            # JSON ni topish
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
    
    def _fallback_parsing(self, food_text: str) -> List[FoodItem]:
        """LLM ishlamasa oddiy parsing"""
        # Oddiy regex yoki keyword based parsing
        # Bu yerda soddalashtirilgan versiya
        food_items = []
        
        # O'zbek tilidagi umumiy ovqatlar
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
        }
        
        text_lower = food_text.lower()
        
        for food_name, food_info in common_foods.items():
            if food_name in text_lower:
                # Miqdorni aniqlash
                quantity = 1
                if "2" in text_lower or "ikki" in text_lower:
                    quantity = 2
                elif "3" in text_lower or "uch" in text_lower:
                    quantity = 3
                elif "4" in text_lower or "to'rt" in text_lower:
                    quantity = 4
                elif "5" in text_lower or "besh" in text_lower:
                    quantity = 5
                
                food_item = FoodItem(
                    name=food_name,
                    quantity=quantity,
                    unit=food_info["unit"],
                    description=food_info["description"]
                )
                food_items.append(food_item)
        
        return food_items
    
    async def get_food_suggestions(self, partial_text: str) -> List[str]:
        """Ovqat takliflarini olish"""
        try:
            prompt = f"""
"{partial_text}" bilan boshlanadigan ovqatlar ro'yxatini bering. 
Faqat ovqat nomlarini vergul bilan ajrating.
"""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Siz ovqat nomlarini taklif qiluvchi assistant."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            content = response.choices[0].message.content
            suggestions = [s.strip() for s in content.split(',') if s.strip()]
            
            return suggestions[:10]  # Faqat 10 ta taklif
            
        except Exception as e:
            print(f"Taklif olishda xatolik: {e}")
            return [] 