import os
import aiohttp
import asyncio
from typing import Optional, Dict, Any

from .product_info import ProductInfoFetcher
from .product_search import ProductSearchFetcher
from .barcode_lookup import BarcodeLookupFetcher
from .category_fetcher import CategoryFetcher
from .brand_fetcher import BrandFetcher

class OpenFoodFactsAPI:
    def __init__(self):
        self.base_url = "https://world.openfoodfacts.org/api/v2"
        self.search_url = "https://world.openfoodfacts.org/cgi/search.pl"
        self.product_info = ProductInfoFetcher(self.base_url, self.search_url)
        self.product_search = ProductSearchFetcher(self.base_url, self.search_url)
        self.barcode_lookup = BarcodeLookupFetcher(self.base_url)
        self.category_fetcher = CategoryFetcher()
        self.brand_fetcher = BrandFetcher()

    async def get_nutrition(self, food_name: str):
        return await self.product_info.get_nutrition(food_name)

    async def search_foods(self, query: str, max_results: int = 5):
        return await self.product_search.search_foods(query, max_results)

    async def get_product_by_barcode(self, barcode: str):
        return await self.barcode_lookup.get_product_by_barcode(barcode)

    async def get_categories(self):
        return await self.category_fetcher.get_categories()

    async def get_brands(self):
        return await self.brand_fetcher.get_brands()
    
    def get_api_info(self) -> Dict[str, Any]:
        """API ma'lumotlari"""
        return {
            "name": "Open Food Facts",
            "base_url": self.base_url,
            "has_api_key": False,  # Bepul API
            "features": [
                "calories",
                "protein",
                "fat",
                "carbohydrates",
                "fiber",
                "sugar",
                "sodium",
                "salt",
                "detailed_nutrition",
                "food_search",
                "barcode_scanning",
                "brands",
                "categories",
                "ingredients",
                "allergens",
                "nutrition_grade",
                "nova_group",
                "ecoscore",
                "product_images",
                "free_api"
            ]
        } 