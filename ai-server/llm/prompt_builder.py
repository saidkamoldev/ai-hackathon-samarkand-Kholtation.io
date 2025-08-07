class PromptBuilder:
    @staticmethod
    def create_analysis_prompt(food_text: str) -> str:
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