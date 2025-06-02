#!/bin/bash
set -e

# Build script for the batch service
# Usage: ./build.sh [tier]
# tier: dev (default) or prod

# Default to dev if not specified
TIER=${1:-dev}
TAG=${TIER}

# Convert "prod" tier to "latest" tag
if [[ "$TIER" == "prod" ]]; then
  TAG="latest"
fi

echo "Building batch service with tag: $TAG"
echo "===================================="

# Build the Docker image
docker build -t batch:$TAG .

echo "batch service built successfully with tag batch:$TAG"

# Load image into kind cluster if it exists
if command -v kind &> /dev/null && kind get clusters | grep -q "k8s-lab-cluster"; then
  echo "Loading image into kind cluster 'k8s-lab-cluster'..."
  kind load docker-image "batch:$TAG" --name "k8s-lab-cluster"
  echo "Image loaded into kind cluster"
else
  echo "Note: 'kind' command not found or 'k8s-lab-cluster' not running."
  echo "Image was built but not loaded into any kind cluster."
fi
