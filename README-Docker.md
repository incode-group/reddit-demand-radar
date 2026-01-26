# Reddit Demand Radar - Docker Production Setup

This document provides comprehensive instructions for setting up Reddit Demand Radar in a production environment using Docker Compose.

## 🏗️ Architecture

The production setup consists of the following services:

- **PostgreSQL Database**: Primary data storage with health checks and optimized configuration
- **Redis Cache**: In-memory caching for rate limiting and temporary data
- **Backend API**: NestJS application with AI analysis capabilities
- **Frontend Application**: Next.js application with real-time status updates
- **Nginx (Optional)**: Reverse proxy for SSL/HTTPS support

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- At least 4GB RAM
- 2GB free disk space

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 2. Start Production Environment

```bash
# Make the startup script executable
chmod +x scripts/start-production.sh

# Run the production startup script
./scripts/start-production.sh
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Checks**: http://localhost:4000/health

## 🔧 Configuration

### Required Environment Variables

```bash
# Database
POSTGRES_PASSWORD=your_secure_password
REDIS_PASSWORD=your_redis_password

# Reddit API (Required)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=your_user_agent_string

# AI Providers (Required)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Application
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

### Getting Reddit API Credentials

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in the form:
   - Name: Your app name
   - App type: Script
   - Redirect URI: http://localhost:8080 (or your domain)
4. Copy the Client ID and Client Secret

### Getting Gemini API Key

1. Go to https://makersuite.google.com/
2. Create a new project or select existing
3. Navigate to API Keys
4. Create a new API key
5. Copy the API key

## 🐳 Docker Compose Services

### Core Services

```yaml
postgres: # PostgreSQL database
  - Port: 5432
  - Health check: pg_isready
  - Volume: postgres_data

redis: # Redis cache
  - Port: 6379
  - Health check: redis-cli ping
  - Volume: redis_data

backend: # NestJS API
  - Port: 4000
  - Health check: /health endpoint
  - Depends on: postgres, redis

frontend: # Next.js application
  - Port: 3000
  - Health check: HTTP GET /
  - Depends on: backend
```

### Optional Services

```yaml
nginx: # Reverse proxy (production profile)
  - Port: 80, 443
  - Profile: production
  - SSL support with Let's Encrypt
```

## 📊 Service Management

### View Service Status

```bash
# Check all services
docker-compose ps

# Check specific service
docker-compose ps backend
```

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f frontend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

## 🔍 Health Checks

Each service includes health checks:

- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping` command
- **Backend**: HTTP GET to `/health` endpoint
- **Frontend**: HTTP GET to `/` endpoint

## 🛡️ Security Features

### Network Isolation

- All services run on a dedicated Docker network
- Services can only communicate through defined ports
- No direct external access to database or Redis

### User Permissions

- Applications run as non-root users
- Proper file permissions and ownership
- Database user has minimal required privileges

### Environment Variables

- Sensitive data stored in environment variables
- Default passwords should be changed
- Support for Docker secrets in production

## 🚀 Production Deployment

### SSL/HTTPS Setup

```bash
# Start with nginx profile for SSL
docker-compose --profile production up -d

# Configure SSL certificates in nginx/ssl/
# Update nginx configuration in nginx/conf.d/
```

### Monitoring

```bash
# Monitor resource usage
docker stats

# Check service health
docker-compose exec backend curl http://localhost:4000/health
```

### Backup and Recovery

```bash
# Backup database
docker-compose exec postgres pg_dump -U reddit_user reddit_radar > backup.sql

# Restore database
docker-compose exec -T postgres psql -U reddit_user -d reddit_radar < backup.sql
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Permission errors**: Ensure proper file permissions
3. **Network issues**: Check Docker network configuration
4. **Health check failures**: Verify service dependencies

### Debug Commands

```bash
# Check container status
docker ps

# Inspect container
docker inspect container_name

# Execute commands in container
docker-compose exec backend bash
```

### Log Analysis

```bash
# View recent logs
docker-compose logs --tail=100

# Filter logs by service
docker-compose logs backend | grep ERROR
```

## 📈 Performance Optimization

### Database Optimization

- Auto-vacuum enabled
- Optimized memory settings
- Connection pooling
- Query performance monitoring

### Application Optimization

- Multi-stage Docker builds
- Health checks for auto-recovery
- Resource limits and monitoring
- Caching with Redis

### Network Optimization

- Docker network optimization
- Load balancing (with nginx)
- SSL termination
- CDN integration support

## 🔧 Customization

### Adding Services

1. Update `docker-compose.yml`
2. Create Dockerfile if needed
3. Update environment variables
4. Test locally before production

### Customizing Configuration

- Database: Modify `database/init.sql`
- Redis: Update Redis configuration
- Nginx: Customize `nginx/conf.d/`
- Application: Update environment variables

## 📞 Support

For issues and questions:

1. Check the logs: `docker-compose logs`
2. Verify configuration: `docker-compose config`
3. Test connectivity: `docker-compose exec`
4. Check health: `curl http://localhost:4000/health`

## 📄 License

This Docker setup is part of the Reddit Demand Radar project.
