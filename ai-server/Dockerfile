# Python AI server Dockerfile
FROM python:3.11-slim

# Ish papkasini belgilash
WORKDIR /app

# Kerakli paketlarni o'rnatish
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Requirements faylini nusxalash
COPY requirements.txt .

# Python bog'liqliklarini o'rnatish
RUN pip install --no-cache-dir -r requirements.txt

# Kodni nusxalash
COPY . .

# Port ochish
EXPOSE 8000

# Dasturni ishga tushirish
CMD ["python", "main.py"] 