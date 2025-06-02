#!/bin/bash
set -e

# Script to deploy the metrics frontend service to Kubernetes

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

echo "Deploying metrics-frontend to '$TIER' tier..."

# Check if the image exists
if ! docker image inspect metrics:$TAG >/dev/null 2>&1; then
  echo "Error: Docker image 'metrics:$TAG' not found"
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

kubectl apply -f $MANIFEST_DIR/metrics-deployment.yaml
kubectl apply -f $MANIFEST_DIR/metrics-service.yaml

echo "Deployment complete. Checking status..."
kubectl get pods -l app=metrics

echo "To access the metrics dashboard:"
echo "kubectl port-forward svc/metrics 8080:80"
echo "Then open http://localhost:8080 in your browser"
