#!/bin/bash
set -e

# Script to build all microservices
# Usage: ./build-all.sh [tier]
# tier: dev (default) or prod

# Default to dev if not specified
TIER=${1:-dev}
TAG=${TIER}

# Convert "prod" tier to "latest" tag
if [[ "$TIER" == "prod" ]]; then
  TAG="latest"
fi

echo "Building all microservices with tag: $TAG"
echo "========================================="

# Function to build a service
build_service() {
  local SERVICE=$1
  local BUILD_SCRIPT="services/$SERVICE/build.sh"
  
  echo "Building $SERVICE service..."
  
  if [[ -f "$BUILD_SCRIPT" ]]; then
    # If build script exists, use it
    (cd "services/$SERVICE" && ./build.sh "$TIER")
  else
    # Otherwise build with Docker directly
    echo "No build script found, using direct Docker build for $SERVICE"
    (cd "services/$SERVICE" && docker build -t "$SERVICE:$TAG" .)
  fi
  
  echo "$SERVICE service built successfully with tag $SERVICE:$TAG"
  echo "---------------------------------------------------------"
}

# Build each service
build_service "shortener"
build_service "thumb"
build_service "batch"
build_service "echo"
build_service "metrics"

# Load images into kind cluster if it exists
if command -v kind &> /dev/null && kind get clusters | grep -q "k8s-lab-cluster"; then
  echo "Loading images into kind cluster 'k8s-lab-cluster'..."
  
  kind load docker-image "shortener:$TAG" --name "k8s-lab-cluster"
  kind load docker-image "thumb:$TAG" --name "k8s-lab-cluster"
  kind load docker-image "batch:$TAG" --name "k8s-lab-cluster"
  kind load docker-image "echo:$TAG" --name "k8s-lab-cluster"
  kind load docker-image "metrics:$TAG" --name "k8s-lab-cluster"
  
  echo "All images loaded into kind cluster"
else
  echo "Note: 'kind' command not found or 'k8s-lab-cluster' not running."
  echo "Images were built but not loaded into any kind cluster."
fi

echo "All services built successfully!"
