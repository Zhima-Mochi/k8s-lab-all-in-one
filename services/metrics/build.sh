#!/bin/bash
set -e

# Build the metrics-frontend Docker image
echo "Building metrics-frontend Docker image..."

# Determine which tag to use
if [ "$1" = "dev" ]; then
  TAG="dev"
  echo "Building development image with tag: metrics:$TAG"
else
  TAG="latest"
  echo "Building production image with tag: metrics:$TAG"
fi

# Build the Docker image
docker build -t metrics:$TAG .

echo "Docker image built successfully: metrics:$TAG"
