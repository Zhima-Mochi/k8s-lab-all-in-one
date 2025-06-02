#!/bin/bash
set -e

# Script to deploy all microservices to a specific tier
# Usage: ./deploy-all.sh [tier]
# tier: dev (default), standard, or ha

# Default to dev if not specified
TIER=${1:-dev}

# Validate tier argument
if [[ "$TIER" != "dev" && "$TIER" != "standard" && "$TIER" != "ha" ]]; then
  echo "Error: Invalid tier specified. Must be one of: dev, standard, ha"
  echo "Usage: ./deploy-all.sh [tier]"
  exit 1
fi

echo "Deploying all microservices to '$TIER' tier..."
echo "=============================================="

# Check if the cluster is running
if ! kubectl cluster-info >/dev/null 2>&1; then
  echo "Error: Cannot connect to Kubernetes cluster"
  echo "Please ensure your cluster is running and kubectl is configured correctly"
  exit 1
fi

# Define manifest directory based on tier
MANIFEST_DIR="manifests/$TIER"

# Function to deploy a service
deploy_service() {
  local SERVICE=$1
  local DEPLOY_SCRIPT="services/$SERVICE/deploy.sh"
  
  echo "Deploying $SERVICE service..."
  
  if [[ -f "$DEPLOY_SCRIPT" ]]; then
    # If deploy script exists, use it
    (cd "services/$SERVICE" && ./deploy.sh "$TIER")
  else
    # Otherwise deploy with kubectl directly using manifests
    echo "No deploy script found, using kubectl apply for $SERVICE"
    if [[ -f "$MANIFEST_DIR/$SERVICE-deployment.yaml" ]]; then
      kubectl apply -f "$MANIFEST_DIR/$SERVICE-deployment.yaml"
    fi
    if [[ -f "$MANIFEST_DIR/$SERVICE-service.yaml" ]]; then
      kubectl apply -f "$MANIFEST_DIR/$SERVICE-service.yaml"
    fi
  fi
  
  echo "$SERVICE service deployed successfully to $TIER tier"
  echo "---------------------------------------------------------"
}

# Deploy Redis first (if it exists in the tier)
if [[ -f "$MANIFEST_DIR/redis-deployment.yaml" ]]; then
  echo "Deploying Redis..."
  kubectl apply -f "$MANIFEST_DIR/redis-deployment.yaml"
  kubectl apply -f "$MANIFEST_DIR/redis-service.yaml"
  echo "Redis deployed successfully"
  echo "---------------------------------------------------------"
fi

# Deploy each service
deploy_service "shortener"
deploy_service "thumb"
deploy_service "batch-api"
deploy_service "batch-worker"
deploy_service "echo"
deploy_service "metrics"

echo "Checking deployment status..."
kubectl get pods
kubectl get svc

echo "All services deployed successfully to $TIER tier!"
echo ""
echo "To access services externally, you can use port-forwarding, for example:"
echo "kubectl port-forward svc/shortener 8000:80"
echo "kubectl port-forward svc/metrics 8080:80"
echo "kubectl port-forward svc/echo 8081:8080"
