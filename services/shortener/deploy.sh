#!/bin/bash
set -e

# Script to deploy the shortener service to Kubernetes
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

echo "Deploying shortener service to '$TIER' tier..."

# Check if the image exists
if ! docker image inspect shortener:$TAG >/dev/null 2>&1; then
  echo "Error: Docker image 'shortener:$TAG' not found"
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

kubectl apply -f $MANIFEST_DIR/shortener-deployment.yaml
kubectl apply -f $MANIFEST_DIR/shortener-service.yaml

echo "Deployment complete. Checking status..."
kubectl get pods -l app=shortener

echo "To access the shortener service:"
echo "kubectl port-forward svc/shortener 8000:80"
echo "Then you can use curl or a browser to access http://localhost:8000"
