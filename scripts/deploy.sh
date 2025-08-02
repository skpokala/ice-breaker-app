#!/bin/bash

# Ice Breaker App Deployment Script
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

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev              Start development environment (local builds)"
    echo "  prod             Start production environment (ghcr.io images)"
    echo "  build            Build and push images to ghcr.io"
    echo "  pull             Pull latest images from ghcr.io"
    echo "  stop             Stop all containers"
    echo "  logs             Show logs for all services"
    echo "  clean            Remove containers and volumes"
    echo "  health           Check health status of all services"
    echo "  help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev           # Start development environment"
    echo "  $0 prod          # Start production environment"
    echo "  $0 build         # Build and push new images"
    echo "  $0 logs backend  # Show backend logs"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if logged into ghcr.io
check_ghcr_auth() {
    if ! docker system info | grep -q "ghcr.io"; then
        print_warning "Not logged into ghcr.io. Run: docker login ghcr.io"
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build -d
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend: http://localhost:8000"
    echo "  - Admin: http://localhost:3000/admin"
    echo "  - MongoDB: localhost:27017"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment with ghcr.io images..."
    check_ghcr_auth
    docker-compose up -d
    print_success "Production environment started!"
    print_status "Services available at:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend: http://localhost:8000"
    echo "  - Admin: http://localhost:3000/admin"
}

# Function to pull latest images
pull_images() {
    print_status "Pulling latest images from ghcr.io..."
    check_ghcr_auth
    docker-compose pull
    print_success "Images pulled successfully!"
}

# Function to build and push images
build_push() {
    print_status "Building and pushing images to ghcr.io..."
    check_ghcr_auth
    
    # Build backend
    print_status "Building backend image..."
    docker build -t ghcr.io/skpokala/ice-breaker-app/backend:latest ./backend
    docker push ghcr.io/skpokala/ice-breaker-app/backend:latest
    
    # Build frontend
    print_status "Building frontend image..."
    docker build -t ghcr.io/skpokala/ice-breaker-app/frontend:latest ./frontend
    docker push ghcr.io/skpokala/ice-breaker-app/frontend:latest
    
    print_success "Images built and pushed successfully!"
}

# Function to stop containers
stop_containers() {
    print_status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    print_success "All containers stopped!"
}

# Function to show logs
show_logs() {
    if [ -n "$2" ]; then
        print_status "Showing logs for $2..."
        docker-compose logs -f "$2"
    else
        print_status "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to check health
check_health() {
    print_status "Checking service health..."
    echo ""
    
    # Check containers
    docker-compose ps
    echo ""
    
    # Check specific endpoints
    print_status "Testing endpoints..."
    
    # Backend health
    if curl -sf http://localhost:8000/api/health >/dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not responding"
    fi
    
    # Frontend health
    if curl -sf http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi
    
    # MongoDB health
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        print_success "MongoDB is healthy"
    else
        print_error "MongoDB is not responding"
    fi
}

# Main script logic
check_docker

case "$1" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "build")
        build_push
        ;;
    "pull")
        pull_images
        ;;
    "stop")
        stop_containers
        ;;
    "logs")
        show_logs "$@"
        ;;
    "clean")
        clean_up
        ;;
    "health")
        check_health
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    "")
        print_error "No command specified."
        echo ""
        show_usage
        exit 1
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac 