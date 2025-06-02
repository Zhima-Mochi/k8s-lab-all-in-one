#!/bin/bash
set -e

# Script to deploy the batch service to Kubernetes
# Usage: ./deploy.sh [tier]
# tier: dev (default), standard, or ha

# Default to 'dev' tier if not specified
TIER=${1:-dev}

# Validate tier argument
if [[ "$TIER" != "dev" && "$TIER" != "standard" && "$TIER" != "ha" ]]; then
  echo "Error: Invalid tier specified. Must be one of: dev, standard, ha"
  echo "Usage: ./deploy.sh [tier]"
  exit 1
fi

# Set variables based on tier
if [[ "$TIER" = "dev" ]]; then
  TAG="dev"
else
  TAG="latest"
fi

echo "Deploying batch service to '$TIER' tier..."

# Check if the images exist
if ! docker image inspect batch:$TAG >/dev/null 2>&1; then
  echo "Error: Docker image 'batch:$TAG' not found"
  echo "Please build the image first with: ./build.sh $([[ "$TIER" = "dev" ]] && echo "dev" || echo "")"
  exit 1
fi

# Check if the cluster is running
if ! kubectl cluster-info >/dev/null 2>&1; then
  echo "Error: Cannot connect to Kubernetes cluster"
  echo "Please ensure your cluster is running and kubectl is configured correctly"
  exit 1
fi

# Deploy to Kubernetes
echo "Applying Kubernetes manifests for $TIER tier..."

MANIFEST_DIR="../../manifests/$TIER"

# First deploy Redis if it's not already running
if ! kubectl get deployment redis -n default >/dev/null 2>&1; then
  echo "Deploying Redis..."
  kubectl apply -f $MANIFEST_DIR/redis-deployment.yaml
  kubectl apply -f $MANIFEST_DIR/redis-service.yaml
  
  # Wait for Redis to be ready
  echo "Waiting for Redis to be ready..."
  kubectl wait --for=condition=available --timeout=60s deployment/redis
fi

# Deploy batch-api
echo "Deploying batch-api..."
kubectl apply -f $MANIFEST_DIR/batch-api-deployment.yaml
kubectl apply -f $MANIFEST_DIR/batch-api-service.yaml

# Deploy batch-worker
echo "Deploying batch-worker..."
kubectl apply -f $MANIFEST_DIR/batch-worker-deployment.yaml

echo "Deployment complete. Checking status..."
kubectl get pods -l app=batch-api
kubectl get pods -l app=batch-worker
kubectl get pods -l app=redis

echo "To access the batch-api service:"
echo "kubectl port-forward svc/batch-api 8002:80"
echo "Then you can use curl or a browser to access http://localhost:8002"
