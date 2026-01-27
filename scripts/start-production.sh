#!/bin/bash

# Reddit Demand Radar - Production Startup Script (V2)
set -e

echo "🚀 Starting Reddit Demand Radar (Docker Compose V2 Mode)"
echo "=================================================="

# 1. Проверка .env
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

source .env

# 2. Функция проверки переменных
check_env_var() {
    local var_value="${!1}"
    if [ -z "$var_value" ]; then
        echo "❌ Error: $1 is not set in .env"
        exit 1
    fi
}

echo "📋 Validating environment..."
check_env_var "REDDIT_CLIENT_ID"
check_env_var "REDDIT_SECRET_KEY"
check_env_var "DATABASE_URL"
check_env_var "REDIS_URL"
check_env_var "GOOGLE_GEMINI_API_KEY"
echo "✅ Environment is ready"

# 3. Чистка мусора и папок
echo "📁 Preparing directories..."
mkdir -p nginx/conf.d nginx/ssl nginx/logs

# 4. Сборка и запуск через V2
echo "🏗️  Building images..."
docker compose build  # <-- Вот тут убрали дефис

echo "🐳 Starting containers..."
docker compose up -d  # <-- И тут

# 5. Проверка здоровья
echo "⏳ Waiting for services (10s)..."
sleep 10

echo "🏥 Checking service health..."

# Проверка Redis через V2
if docker compose exec -T redis redis-cli -a ${REDIS_PASSWORD} ping | grep -q PONG; then
    echo "  ✅ Redis: Online"
else
    echo "  ❌ Redis: Connection failed"
fi

# Проверка Backend
if curl -s -f http://localhost:4000/health > /dev/null 2>&1; then
    echo "  ✅ Backend API: Online"
else
    echo "  ⚠️  Backend: Still starting or check logs (docker compose logs backend)"
fi

# Проверка Frontend
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✅ Frontend: Online"
else
    echo "  ⚠️  Frontend: Check logs (docker compose logs frontend)"
fi

echo ""
echo "🎉 System is up via Docker Compose V2!"
echo "--------------------------------------------------"
echo "🔗 Frontend: http://localhost:3000"
echo "--------------------------------------------------"