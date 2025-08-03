# Docker Automation Guide

This guide covers the automated Docker build and push system for the Ice Breaker App.

## 🚀 Overview

The application now includes automated Docker image building and pushing to GitHub Container Registry (ghcr.io) with proper version tagging.

## 📦 What Gets Automated

- **Version Tagging**: Each Docker image is tagged with the current application version
- **Latest Tagging**: Images are also tagged as `latest` for easy deployment
- **Multi-Image Build**: Both backend and frontend images are built simultaneously
- **Auto-Push**: Images are automatically pushed to ghcr.io on every `git push`
- **Error Handling**: Graceful fallback if Docker operations fail

## 🛠️ New Scripts and Commands

### Docker Build and Push Script

The new `scripts/docker-build-push.sh` script handles all Docker operations:

```bash
# Build images locally (no push)
./scripts/docker-build-push.sh build

# Build and push images with current version + latest tags
./scripts/docker-build-push.sh push

# Build and push with specific version only (no latest tag)
./scripts/docker-build-push.sh push-version

# Build and push with custom version
./scripts/docker-build-push.sh push --version 2.1.0
```

### NPM Scripts

New package.json scripts for Docker operations:

```bash
# Build Docker images locally
npm run docker:build-only

# Build and push images to ghcr.io
npm run docker:push

# Push with version tag only
npm run docker:push-version

# Build frontend + Docker images
npm run build:all

# Complete release with Docker images (recommended)
npm run release:patch    # Version bump + Docker push + git push
npm run release:minor
npm run release:major
```

### Existing Scripts (Enhanced)

The original deployment scripts still work:

```bash
# Original deployment scripts (still available)
npm run docker:dev      # Local development
npm run docker:prod     # Production from ghcr.io
npm run docker:build    # Legacy build command
```

## 🔄 Automated Workflow

### Pre-Push Hook (Automatic)

Every time you run `git push`, the system automatically:

1. **Increments Version** (patch level)
2. **Builds Docker Images** with new version tag
3. **Pushes to ghcr.io** (both version and latest tags)
4. **Commits Version Bump**
5. **Continues with Git Push**

### Manual Release Workflow

For controlled releases, use the new release commands:

```bash
# For bug fixes
npm run release:patch

# For new features
npm run release:minor

# For breaking changes
npm run release:major
```

## 🏷️ Image Tagging Strategy

### Automatic Tags

- **Version Tag**: `ghcr.io/skpokala/ice-breaker-app/backend:1.2.3`
- **Latest Tag**: `ghcr.io/skpokala/ice-breaker-app/backend:latest`

### Image Names

- **Backend**: `ghcr.io/skpokala/ice-breaker-app/backend`
- **Frontend**: `ghcr.io/skpokala/ice-breaker-app/frontend`

## 🔐 Authentication

The system automatically handles authentication in this order:

1. **Check existing Docker login** to ghcr.io
2. **Try GitHub CLI** (`gh auth token`) if available
3. **Prompt for manual login** if needed

### Manual Authentication Options

```bash
# Option 1: Docker login with GitHub PAT
docker login ghcr.io -u your-username
# Enter your GitHub Personal Access Token as password

# Option 2: GitHub CLI
gh auth login --scopes 'write:packages,read:packages'
```

## 📁 Project Structure

```
ice-breaker-app/
├── scripts/
│   ├── docker-build-push.sh    # New: Docker automation script
│   └── deploy.sh               # Existing: Deployment script
├── .git/hooks/
│   └── pre-push                # Enhanced: Includes Docker operations
├── package.json                # Enhanced: New Docker scripts
└── DOCKER_AUTOMATION.md        # This documentation
```

## 🎯 Usage Examples

### Development Workflow

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new feature"

# 2. Push (automatic versioning + Docker build/push)
git push
```

### Release Workflow

```bash
# For a minor release with full control
npm run release:minor
```

### Manual Docker Operations

```bash
# Just build images locally for testing
npm run docker:build-only

# Build and push current version
npm run docker:push

# Build specific version
./scripts/docker-build-push.sh push --version 2.0.0
```

### Production Deployment

```bash
# Deploy latest images from ghcr.io
npm run docker:prod

# Or manually pull and run
docker pull ghcr.io/skpokala/ice-breaker-app/backend:latest
docker pull ghcr.io/skpokala/ice-breaker-app/frontend:latest
```

## ❌ Troubleshooting

### Authentication Issues

```bash
# Check if logged in
docker system info | grep ghcr.io

# Manual login
docker login ghcr.io -u your-username
```

### Pre-Push Hook Issues

If the pre-push hook fails:

```bash
# Skip the hook temporarily
git push --no-verify

# Then manually push Docker images
npm run docker:push
```

### Build Failures

If Docker build fails:

```bash
# Check Docker daemon
docker --version

# Check authentication
docker login ghcr.io -u your-username

# Manual build
./scripts/docker-build-push.sh build
```

## 📊 Benefits

- **Consistency**: Every push creates properly versioned images
- **Automation**: No manual Docker commands needed
- **Traceability**: Images are tied to specific versions
- **Rollback**: Easy to deploy previous versions
- **CI/CD Ready**: GitHub Actions also builds images automatically

## 🔄 Migration from Old System

If you were using the old deployment scripts:

- **`./scripts/deploy.sh build`** → **`npm run docker:push`**
- **Manual versioning** → **Automatic with `git push`**
- **Single tag** → **Version + latest tags**

The old scripts still work, but the new system provides better automation and versioning.

## 📝 Configuration

### Disable Auto-Push

To disable automatic Docker operations in pre-push hook:

```bash
# Edit .git/hooks/pre-push and comment out the Docker section
```

### Custom Registry

To use a different registry, edit `scripts/docker-build-push.sh`:

```bash
# Change this line
local REGISTRY="ghcr.io/skpokala/ice-breaker-app"
```

## 🎉 Summary

The new Docker automation system provides:

- ✅ **Automatic versioning and tagging**
- ✅ **Seamless ghcr.io integration**
- ✅ **Error handling and fallbacks**
- ✅ **Backward compatibility**
- ✅ **Comprehensive documentation**

Your workflow is now: **Code → Commit → Push → Deployed!** 🚀 