#!/bin/bash

# Reddit Demand Radar - Production Startup Script
# This script sets up and starts the production environment

set -e

echo "🚀 Starting Reddit Demand Radar Production Environment"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
check_env_var() {
    if [ -z "${!1}" ] || [ "${!1}" = "your_${1,,}_here" ]; then
        echo "❌ Error: $1 is not set in .env file"
        exit 1
    fi
}

echo "📋 Checking required environment variables..."
check_env_var "REDDIT_CLIENT_ID"
check_env_var "REDDIT_CLIENT_SECRET"
check_env_var "REDDIT_USER_AGENT"
check_env_var "GEMINI_API_KEY"
echo "✅ All required environment variables are set"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p database
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p nginx/logs

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose build --no-cache

echo "🐳 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check PostgreSQL
echo "  Checking PostgreSQL..."
if docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-reddit_user} -d ${POSTGRES_DB:-reddit_radar} > /dev/null 2>&1; then
    echo "  ✅ PostgreSQL is ready"
else
    echo "  ❌ PostgreSQL is not ready"
fi

# Check Redis
echo "  Checking Redis..."
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "  ✅ Redis is ready"
else
    echo "  ❌ Redis is not ready"
fi

# Check Backend
echo "  Checking Backend..."
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    echo "  ✅ Backend is ready"
else
    echo "  ⚠️  Backend might still be starting (check logs with: docker-compose logs backend)"
fi

# Check Frontend
echo "  Checking Frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✅ Frontend is ready"
else
    echo "  ⚠️  Frontend might still be starting (check logs with: docker-compose logs frontend)"
fi

echo ""
echo "🎉 Reddit Demand Radar is starting up!"
echo ""
echo "📊 Services Status:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Backend API: http://localhost:4000"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "🔧 Management Commands:"
echo "   - View logs: docker-compose logs [service]"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - View service status: docker-compose ps"
echo ""
echo "⚠️  Important Notes:"
echo "   - Make sure to configure your Reddit API credentials in .env"
echo "   - Configure your Gemini API key in .env"
echo "   - For production, consider setting up SSL with the nginx profile"
echo "   - Monitor logs regularly for any issues"
echo ""
echo "✨ Happy analyzing!"