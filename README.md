# Yogin.uz - Shaxsiy Ovqatlanish va Sog'lom Hayot Tarzi Platformasi

## 🌟 Umumiy Ma'lumot

Yogin.uz — bu sizning shaxsiy raqamli dietologingiz va sog'lom hayot tarzi bo'yicha yo'lbonchi dasturingizdir. Platforma Next.js frontend, Go backend va Python AI server asosida ishlab chiqilgan bo'lib, foydalanuvchilarga individual ovqatlanish rejalari, kaloriya nazorati va motivatsion yordam orqali sog'lom turmush tarzini boshqarishda yordam beradi.

## 🏗️ Arxitektura

```
Frontend (Next.js) 
    ↓
Backend (Go) - Gamifikatsiya & Filter
    ↓
AI Server (Python) - LLM & API Integratsiya
    ↓
Database (PostgreSQL)
```

## 📁 Loyiha Strukturasi

```
yogin.uz/
├── frontend/                 # Next.js frontend (tayyor)
├── backend/                  # Go backend - gamifikatsiya va filter
│   ├── cmd/
│   ├── internal/
│   │   ├── user/            # Foydalanuvchi boshqaruvi
│   │   ├── plan/            # Ovqatlanish rejalari
│   │   ├── gamification/    # Gamifikatsiya
│   │   ├── filter/          # Ma'lumotlarni filtrlash
│   │   └── ai_proxy/        # AI server bilan integratsiya
│   ├── pkg/
│   └── db/
├── ai-server/               # Python AI server
│   ├── integrations/        # API integratsiyalari
│   │   ├── calorieninjas.py
│   │   ├── nutritionix.py
│   │   ├── edamam.py
│   │   ├── usda.py
│   │   └── openfoodfacts.py
│   ├── llm/                 # LLM modullari
│   ├── schemas/             # Ma'lumotlar strukturasi
│   └── main.py
└── docker-compose.yml       # Docker konfiguratsiyasi
```

## 🚀 O'rnatish va Ishga Tushirish

### 1. Backend (Go)
```bash
cd backend
go mod tidy
go run ./cmd
```

### 2. AI Server (Python)
```bash
cd ai-server
pip install -r requirements.txt
python main.py
```

### 3. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## 🔧 API Endpointlar

### Backend API
- `POST /api/users` - Foydalanuvchi yaratish
- `GET /api/users/{id}` - Foydalanuvchi ma'lumotlari
- `POST /api/plans` - Ovqatlanish rejasi yaratish
- `POST /api/food/analyze` - Ovqat tahlili

### AI Server API
- `POST /api/analyze-food` - Ovqat tahlili va kaloriya hisoblash
- `GET /api/nutrition/{food_name}` - Oziq-ovqat ma'lumotlari
- `GET /api/openfoodfacts/search` - Open Food Facts da qidirish
- `GET /api/openfoodfacts/barcode/{barcode}` - Barkod bo'yicha mahsulot
- `GET /api/openfoodfacts/categories` - Kategoriyalar ro'yxati
- `GET /api/openfoodfacts/brands` - Brendlar ro'yxati

## 📊 Ma'lumotlar Bazasi

PostgreSQL ma'lumotlar bazasi quyidagi jadvallarni o'z ichiga oladi:
- `users` - Foydalanuvchilar
- `plans` - Ovqatlanish rejalari
- `food_logs` - Ovqat kundaligi
- `gamification` - Gamifikatsiya ma'lumotlari

## 🔗 API Integratsiyalari

Loyiha quyidagi API lardan foydalanadi:

### 🍎 Oziq-ovqat Ma'lumotlari
- **CalorieNinjas** - Kaloriya va nutritsiya ma'lumotlari
- **Nutritionix** - Keng qamrovli oziq-ovqat ma'lumotlari
- **Edamam** - Batafsil nutritsiya tahlili
- **USDA FoodData Central** - Hukumat ma'lumotlari
- **Open Food Facts** - Bepul, ochiq ma'lumotlar bazasi

### 🤖 AI va LLM
- **OpenAI GPT** - Ovqat matnini tahlil qilish
- **LangChain** - LLM integratsiyasi

## 🤝 Hissa Qo'shish

Loyiha rivojiga hissa qo'shishni istaysizmi? Biz doimo yangi g'oyalar va yordamga ochiqmiz!

- Muammolar (Issues) yaratish
- Yangi xususiyatlar taklif qilish
- Kodga o'zgarishlar kiritish (Pull Requests)