# Docker Deployment with GitHub Container Registry (ghcr.io)

## Overview

The Team Ice Breaker App is now configured for automated Docker builds and deployments using GitHub Container Registry (ghcr.io). This setup provides:

- **Automated CI/CD** with GitHub Actions
- **Multi-platform builds** (AMD64, ARM64)
- **Production-ready containers** with security best practices
- **Easy deployment scripts** for development and production
- **Health checks** and monitoring

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- GitHub account with repository access
- (Optional) GitHub CLI for easier authentication

### Development Environment
```bash
# Start development environment (builds locally)
npm run docker:dev
# or
./scripts/deploy.sh dev

# Check health
npm run docker:health
```

### Production Environment
```bash
# Login to GitHub Container Registry
docker login ghcr.io

# Start production environment (uses ghcr.io images)
npm run docker:prod
# or
./scripts/deploy.sh prod
```

## 📋 Available Commands

### NPM Scripts
```bash
npm run docker:dev      # Start development environment
npm run docker:prod     # Start production environment  
npm run docker:build    # Build and push to ghcr.io
npm run docker:stop     # Stop all containers
npm run docker:health   # Check service health
```

### Direct Script Usage
```bash
./scripts/deploy.sh dev      # Development environment
./scripts/deploy.sh prod     # Production environment
./scripts/deploy.sh build    # Build and push images
./scripts/deploy.sh pull     # Pull latest images
./scripts/deploy.sh stop     # Stop containers
./scripts/deploy.sh logs     # View logs
./scripts/deploy.sh clean    # Clean up everything
./scripts/deploy.sh health   # Health check
./scripts/deploy.sh help     # Show help
```

## 🏗️ Architecture

### Container Images
- **Frontend**: `ghcr.io/skpokala/ice-breaker-app/frontend:latest`
  - Nginx-based serving built React app
  - Multi-stage build for optimization
  - Health checks included

- **Backend**: `ghcr.io/skpokala/ice-breaker-app/backend:latest`
  - Node.js with Express server
  - Production-optimized dependencies
  - Health endpoint at `/api/health`

- **Database**: `mongo:7-jammy`
  - Official MongoDB image
  - Persistent data volumes
  - Authentication configured

### Network Configuration
```
Frontend (localhost:3000) 
    ↓
Backend (localhost:8000)
    ↓
MongoDB (localhost:27017)
```

## 🔧 Configuration Files

### Docker Compose Files
- `docker-compose.yml` - Production (ghcr.io images)
- `docker-compose.dev.yml` - Development (local builds)

### Dockerfiles
- `frontend/Dockerfile` - Multi-stage React build
- `backend/Dockerfile` - Node.js production image

### Docker Ignore
- `frontend/.dockerignore` - Excludes unnecessary files
- `backend/.dockerignore` - Optimizes build context

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
File: `.github/workflows/docker-build.yml`

**Triggers:**
- Push to `main`/`master` branch
- Tagged releases (`v*`)
- Pull requests (build only)

**Process:**
1. **Checkout** repository code
2. **Setup** Docker Buildx for multi-platform builds
3. **Login** to ghcr.io using GitHub token
4. **Extract** metadata for tagging
5. **Build** both frontend and backend images
6. **Push** to GitHub Container Registry
7. **Cache** layers for faster subsequent builds

**Features:**
- **Multi-platform builds**: AMD64 and ARM64
- **Automatic tagging**: latest, version, branch
- **Build caching**: Faster builds using GitHub Actions cache
- **Security**: Uses GitHub's built-in tokens

## 🔐 Authentication Setup

### GitHub Container Registry Login
```bash
# Using GitHub CLI (recommended)
gh auth login
docker login ghcr.io

# Using personal access token
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Using username/password
docker login ghcr.io -u USERNAME
```

### Required Permissions
Your GitHub token needs:
- `read:packages` - Pull images
- `write:packages` - Push images
- `delete:packages` - Manage images (optional)

## 🏥 Health Monitoring

### Built-in Health Checks
Each service includes health checks:

**Backend Health Check:**
```bash
curl http://localhost:8000/api/health
```

**Frontend Health Check:**
```bash
wget --spider http://localhost:3000/
```

**MongoDB Health Check:**
```bash
mongosh --eval "db.adminCommand('ping')"
```

### Automated Health Monitoring
```bash
# Check all services
./scripts/deploy.sh health

# Monitor continuously
watch -n 5 './scripts/deploy.sh health'
```

## 🔧 Environment Variables

### Production Environment
```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/icebreaker?authSource=admin
```

### Development Environment
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/icebreaker?authSource=admin
```

## 📊 Image Management

### Image Tagging Strategy
- `latest` - Latest stable release from main branch
- `v1.0.5` - Specific version tags
- `main` - Latest commit from main branch
- `pr-123` - Pull request builds

### Image Cleanup
```bash
# Clean unused images
docker image prune -f

# Remove old versions (keep last 5)
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" \
  | grep ghcr.io/skpokala/ice-breaker-app
```

## 🚀 Deployment Strategies

### Development Workflow
1. **Code changes** → Local testing
2. **Build locally** → `npm run docker:dev`
3. **Test features** → Verify functionality
4. **Push to GitHub** → Triggers automated build
5. **Deploy production** → `npm run docker:prod`

### Production Deployment
```bash
# Method 1: Using deploy script
./scripts/deploy.sh prod

# Method 2: Manual deployment
docker login ghcr.io
docker-compose pull
docker-compose up -d

# Method 3: Zero-downtime deployment
docker-compose pull
docker-compose up -d --no-deps backend
docker-compose up -d --no-deps frontend
```

## 🔍 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check build logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild with verbose output
docker-compose build --no-cache --progress=plain
```

**Authentication Issues:**
```bash
# Verify login
docker info | grep ghcr.io

# Re-authenticate
docker logout ghcr.io
docker login ghcr.io
```

**Port Conflicts:**
```bash
# Check port usage
lsof -i :3000
lsof -i :8000
lsof -i :27017

# Stop conflicting services
./scripts/deploy.sh stop
```

**Health Check Failures:**
```bash
# Check container status
docker-compose ps

# Inspect specific service
docker-compose logs -f backend
docker-compose exec backend node -e "console.log('Backend running')"
```

### Performance Optimization

**Build Performance:**
- Use `.dockerignore` files
- Leverage build caching
- Multi-stage builds for smaller images
- Regular cleanup of unused images

**Runtime Performance:**
- Resource limits in docker-compose
- Health check intervals
- Log rotation configuration
- Volume mounting for persistent data

## 📈 Monitoring & Logging

### Log Management
```bash
# View all logs
./scripts/deploy.sh logs

# View specific service
./scripts/deploy.sh logs backend

# Follow logs in real-time
docker-compose logs -f

# Export logs
docker-compose logs > app-logs.txt
```

### Resource Monitoring
```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Network inspection
docker network ls
docker network inspect ice-breaker-app_app-network
```

## 🎯 Best Practices

### Security
- **Non-root users** in containers
- **Minimal base images** (Alpine Linux)
- **Health checks** for reliability
- **Resource limits** to prevent abuse
- **Environment variables** for secrets

### Reliability
- **Restart policies** for automatic recovery
- **Health checks** with proper timeouts
- **Graceful shutdowns** with signal handling
- **Data persistence** with volumes
- **Network isolation** with custom networks

### Maintenance
- **Regular updates** of base images
- **Security scanning** of containers
- **Backup strategies** for data
- **Monitoring setup** for production
- **Log rotation** and cleanup

---

## 🎉 Success! 

Your Team Ice Breaker App is now ready for professional Docker deployment with:

✅ **Automated CI/CD** with GitHub Actions  
✅ **Production-ready containers** on ghcr.io  
✅ **Easy deployment scripts** for any environment  
✅ **Health monitoring** and logging  
✅ **Multi-platform support** (AMD64/ARM64)  
✅ **Security best practices** implemented  

**Repository**: [skpokala/ice-breaker-app](https://github.com/skpokala/ice-breaker-app)  
**Images**: [ghcr.io/skpokala/ice-breaker-app](https://github.com/skpokala/ice-breaker-app/pkgs/container/ice-breaker-app%2Fbackend) 