import os
from typing import List
from openai import AsyncOpenAI
from schemas.food import FoodItem
from .prompt_builder import PromptBuilder
from .llm_response_parser import LLMResponseParser
from .fallback_parser import FallbackParser

class FoodAnalyzer:
    """LLM yordamida ovqat matnini tahlil qilish"""
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-3.5-turbo"

    async def analyze_food_text(self, food_text: str) -> List[FoodItem]:
        try:
            prompt = PromptBuilder.create_analysis_prompt(food_text)
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
            food_items = LLMResponseParser.parse_llm_response(content)
            return food_items
        except Exception as e:
            print(f"LLM tahlilida xatolik: {e}")
            return FallbackParser.fallback_parsing(food_text)

    async def get_food_suggestions(self, partial_text: str) -> List[str]:
        try:
            prompt = f"Suggest food items for: {partial_text}"
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Suggest food items."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=100
            )
            content = response.choices[0].message.content
            # Простой парсинг списка
            return [item.strip() for item in content.split("\n") if item.strip()]
        except Exception as e:
            print(f"Ovqat taklifida xatolik: {e}")
            return [] 