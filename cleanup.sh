#!/bin/bash
set -e

# Script to clean up Kubernetes resources and Docker images
# Usage: ./cleanup.sh [tier] [--all]
# tier: dev (default), standard, or ha
# --all: also delete Docker images

# Default to 'dev' tier if not specified
TIER=${1:-dev}
DELETE_IMAGES=false

# Check for --all flag
if [[ "$1" == "--all" ]]; then
  TIER="dev"
  DELETE_IMAGES=true
elif [[ "$2" == "--all" ]]; then
  DELETE_IMAGES=true
fi

# Validate tier argument
if [[ "$TIER" != "dev" && "$TIER" != "standard" && "$TIER" != "ha" ]]; then
  echo "Error: Invalid tier specified. Must be one of: dev, standard, ha"
  echo "Usage: ./cleanup.sh [tier] [--all]"
  exit 1
fi

echo "Cleaning up Kubernetes resources for '$TIER' tier..."

# Check if the cluster is running
if ! kubectl cluster-info >/dev/null 2>&1; then
  echo "Error: Cannot connect to Kubernetes cluster"
  echo "Please ensure your cluster is running and kubectl is configured correctly"
  exit 1
fi

# Delete Kubernetes resources
echo "Deleting Kubernetes deployments and services..."

# Define manifest directory based on tier
MANIFEST_DIR="manifests/$TIER"

# Function to delete a service's resources
delete_service() {
  local SERVICE=$1
  echo "Deleting $SERVICE resources..."
  
  # Delete deployment if it exists
  if kubectl get deployment $SERVICE -n default >/dev/null 2>&1; then
    kubectl delete -f "$MANIFEST_DIR/$SERVICE-deployment.yaml" --ignore-not-found
  fi
  
  # Delete service if it exists
  if kubectl get service $SERVICE -n default >/dev/null 2>&1; then
    kubectl delete -f "$MANIFEST_DIR/$SERVICE-service.yaml" --ignore-not-found
  fi
}

# Delete each service
delete_service "shortener"
delete_service "thumb"
delete_service "batch-api"
delete_service "batch-worker"
delete_service "echo"
delete_service "metrics"

# Delete Redis last
if kubectl get deployment redis -n default >/dev/null 2>&1; then
  echo "Deleting Redis resources..."
  kubectl delete -f "$MANIFEST_DIR/redis-deployment.yaml" --ignore-not-found
  kubectl delete -f "$MANIFEST_DIR/redis-service.yaml" --ignore-not-found
fi

# Delete Docker images if requested
if [ "$DELETE_IMAGES" = true ]; then
  echo "Deleting Docker images..."
  
  # Set tag based on tier
  TAG=${TIER}
  if [[ "$TIER" != "dev" ]]; then
    TAG="latest"
  fi
  
  # Delete each service image
  docker rmi shortener:$TAG --force 2>/dev/null || true
  docker rmi thumb:$TAG --force 2>/dev/null || true
  docker rmi batch:$TAG --force 2>/dev/null || true
  docker rmi echo:$TAG --force 2>/dev/null || true
  docker rmi metrics:$TAG --force 2>/dev/null || true
  
  echo "Docker images deleted"
fi

# Check remaining resources
echo "Remaining pods:"
kubectl get pods

echo "Cleanup complete!"
echo ""
echo "To delete the entire cluster, run:"
echo "kind delete cluster --name k8s-lab-cluster"
