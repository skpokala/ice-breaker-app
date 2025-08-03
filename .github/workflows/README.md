# GitHub Actions Workflows

This directory contains the GitHub Actions workflows for the Ice Breaker App.

## Active Workflows

### `docker-build.yml` - Main Build and Deploy Workflow
**Primary workflow** for building and pushing Docker images.

**Triggers:**
- Push to `main`, `master`, or `ghcr-test` branches
- Tagged releases (`v*`)
- Pull requests to `main`/`master`
- Manual dispatch

**Features:**
- **Smart Registry Fallback**: Tries GHCR first, falls back to Docker Hub if GHCR fails
- **Optimized Builds**: Single build step per image (no redundant test builds)
- **Comprehensive Caching**: GitHub Actions cache for faster builds
- **Detailed Summaries**: Rich deployment summaries with links
- **Auto-tagging**: Supports both version tags and `latest`

**Registry Priority:**
1. **Primary**: `ghcr.io/skpokala/ice-breaker-app`
2. **Fallback**: `docker.io/skpokala/ice-breaker-app`

### `docker-hub-backup.yml` - Docker Hub Only Workflow
**Backup solution** for Docker Hub deployment only.

**Triggers:**
- Push to `docker-hub-test` branch
- Manual dispatch

**Use Case**: Standalone Docker Hub deployment when GHCR is unavailable.

## Setup Requirements

### For GHCR (Primary Registry)
1. Repository must have **Packages enabled** in Settings → Features
2. Workflow permissions: **Read and write permissions** in Actions → General
3. Repository should be **public** for best GHCR compatibility

### For Docker Hub (Fallback Registry)
1. Create Docker Hub access token at https://hub.docker.com/settings/security
2. Add `DOCKER_HUB_TOKEN` secret in repository settings
3. Username is configured as `skpokala` in workflow

## Image Naming Convention

### GHCR (Primary)
```
ghcr.io/skpokala/ice-breaker-app/backend:latest
ghcr.io/skpokala/ice-breaker-app/backend:v1.0.0
ghcr.io/skpokala/ice-breaker-app/frontend:latest  
ghcr.io/skpokala/ice-breaker-app/frontend:v1.0.0
```

### Docker Hub (Fallback)
```
skpokala/ice-breaker-app-backend:latest
skpokala/ice-breaker-app-backend:v1.0.0
skpokala/ice-breaker-app-frontend:latest
skpokala/ice-breaker-app-frontend:v1.0.0
```

## Troubleshooting

### Common Issues
- **403 Forbidden on GHCR**: Check repository settings and permissions
- **Build failures**: Check Dockerfile syntax and dependencies
- **Cache issues**: Clear cache by re-running workflow manually

### Debug Information
Each workflow run includes comprehensive debug information in the logs and deployment summaries.

## Migration Notes

**Removed Workflows** (consolidated into main workflow):
- `simple-build.yml` - Replaced by optimized main workflow
- `test-build.yml` - Build testing now integrated
- `ghcr-test.yml` - Authentication testing integrated  
- `minimal-test.yml` - Minimal testing approach integrated

The new consolidated approach eliminates redundancy while maintaining reliability through smart fallbacks.
