#!/bin/bash

# Docker Build and Push Script for Ice Breaker App
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker --version >/dev/null 2>&1; then
        print_error "Docker is not installed or not running"
        exit 1
    fi
}

# Function to check ghcr.io authentication
check_ghcr_auth() {
    print_status "Checking ghcr.io authentication..."
    
    # Try to get auth info
    if ! docker system info | grep -q "ghcr.io" 2>/dev/null; then
        print_warning "Not logged into ghcr.io. Attempting to authenticate..."
        
        # Try GitHub CLI first
        if command -v gh >/dev/null 2>&1; then
            if gh auth status >/dev/null 2>&1; then
                print_status "Using GitHub CLI for authentication..."
                echo "$(gh auth token)" | docker login ghcr.io -u "$(gh api user --jq .login)" --password-stdin
                return 0
            fi
        fi
        
        print_error "Please authenticate with ghcr.io first:"
        echo "  Option 1: docker login ghcr.io -u YOUR_USERNAME"
        echo "  Option 2: gh auth login --scopes 'write:packages,read:packages'"
        exit 1
    fi
    
    print_success "Authentication verified!"
}

# Function to get current version
get_version() {
    if [ -f "package.json" ]; then
        node -p "require('./package.json').version"
    else
        echo "latest"
    fi
}

# Function to build and push images
build_and_push() {
    local VERSION="${1:-$(get_version)}"
    local PUSH_LATEST="${2:-true}"
    
    print_status "Building and pushing Docker images..."
    print_status "Version: $VERSION"
    
    # Registry and image names
    local REGISTRY="ghcr.io/skpokala/ice-breaker-app"
    local BACKEND_IMAGE="$REGISTRY/backend"
    local FRONTEND_IMAGE="$REGISTRY/frontend"
    
    # Build backend image
    print_status "🏗️  Building backend image..."
    docker build -t "$BACKEND_IMAGE:$VERSION" ./backend
    
    if [ "$PUSH_LATEST" = "true" ]; then
        docker tag "$BACKEND_IMAGE:$VERSION" "$BACKEND_IMAGE:latest"
    fi
    
    # Build frontend image
    print_status "🏗️  Building frontend image..."
    docker build -t "$FRONTEND_IMAGE:$VERSION" ./frontend
    
    if [ "$PUSH_LATEST" = "true" ]; then
        docker tag "$FRONTEND_IMAGE:$VERSION" "$FRONTEND_IMAGE:latest"
    fi
    
    # Push backend image
    print_status "⬆️  Pushing backend image..."
    docker push "$BACKEND_IMAGE:$VERSION"
    
    if [ "$PUSH_LATEST" = "true" ]; then
        docker push "$BACKEND_IMAGE:latest"
    fi
    
    # Push frontend image
    print_status "⬆️  Pushing frontend image..."
    docker push "$FRONTEND_IMAGE:$VERSION"
    
    if [ "$PUSH_LATEST" = "true" ]; then
        docker push "$FRONTEND_IMAGE:latest"
    fi
    
    print_success "✅ Images built and pushed successfully!"
    echo ""
    echo "📦 Published Images:"
    echo "   Backend:  $BACKEND_IMAGE:$VERSION"
    echo "   Frontend: $FRONTEND_IMAGE:$VERSION"
    
    if [ "$PUSH_LATEST" = "true" ]; then
        echo "   Backend:  $BACKEND_IMAGE:latest"
        echo "   Frontend: $FRONTEND_IMAGE:latest"
    fi
    
    echo ""
    echo "🔗 View at:"
    echo "   https://github.com/skpokala/ice-breaker-app/pkgs/container/ice-breaker-app%2Fbackend"
    echo "   https://github.com/skpokala/ice-breaker-app/pkgs/container/ice-breaker-app%2Ffrontend"
}

# Function to build only (no push)
build_only() {
    local VERSION="${1:-$(get_version)}"
    
    print_status "Building Docker images locally..."
    print_status "Version: $VERSION"
    
    # Registry and image names
    local REGISTRY="ghcr.io/skpokala/ice-breaker-app"
    local BACKEND_IMAGE="$REGISTRY/backend"
    local FRONTEND_IMAGE="$REGISTRY/frontend"
    
    # Build backend image
    print_status "🏗️  Building backend image..."
    docker build -t "$BACKEND_IMAGE:$VERSION" -t "$BACKEND_IMAGE:latest" ./backend
    
    # Build frontend image
    print_status "🏗️  Building frontend image..."
    docker build -t "$FRONTEND_IMAGE:$VERSION" -t "$FRONTEND_IMAGE:latest" ./frontend
    
    print_success "✅ Images built successfully!"
    echo ""
    echo "📦 Built Images:"
    echo "   Backend:  $BACKEND_IMAGE:$VERSION"
    echo "   Frontend: $FRONTEND_IMAGE:$VERSION"
    echo "   Backend:  $BACKEND_IMAGE:latest"
    echo "   Frontend: $FRONTEND_IMAGE:latest"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build            Build images locally (no push)"
    echo "  push             Build and push images to ghcr.io"
    echo "  push-version     Build and push with specific version tag only"
    echo "  help             Show this help message"
    echo ""
    echo "Options:"
    echo "  --version VERSION    Use specific version (default: from package.json)"
    echo "  --no-latest         Don't tag/push as 'latest'"
    echo ""
    echo "Examples:"
    echo "  $0 build                    # Build images locally"
    echo "  $0 push                     # Build and push with version + latest tags"
    echo "  $0 push --version 1.2.3    # Build and push with specific version"
    echo "  $0 push-version             # Push with version tag only (no latest)"
}

# Main script logic
check_docker

# Parse arguments
COMMAND="${1:-help}"
VERSION=""
PUSH_LATEST="true"

shift || true
while [ $# -gt 0 ]; do
    case $1 in
        --version)
            VERSION="$2"
            shift 2
            ;;
        --no-latest)
            PUSH_LATEST="false"
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Use provided version or get from package.json
if [ -z "$VERSION" ]; then
    VERSION=$(get_version)
fi

case "$COMMAND" in
    "build")
        build_only "$VERSION"
        ;;
    "push")
        check_ghcr_auth
        build_and_push "$VERSION" "$PUSH_LATEST"
        ;;
    "push-version")
        check_ghcr_auth
        build_and_push "$VERSION" "false"
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac 