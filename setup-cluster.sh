#!/bin/bash
set -e

# Script to set up a local Kind Kubernetes cluster for testing
# Usage: ./setup-cluster.sh [cluster-name]

# Default cluster name
CLUSTER_NAME=${1:-k8s-lab-cluster}

echo "Setting up Kind Kubernetes cluster: $CLUSTER_NAME"
echo "================================================"

# Check if kind is installed
if ! command -v kind &> /dev/null; then
  echo "Error: 'kind' command not found."
  echo "Please install Kind first: https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
  exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
  echo "Error: 'kubectl' command not found."
  echo "Please install kubectl first: https://kubernetes.io/docs/tasks/tools/"
  exit 1
fi

# Check if cluster already exists
if kind get clusters | grep -q "$CLUSTER_NAME"; then
  echo "Cluster '$CLUSTER_NAME' already exists."
  echo "Do you want to delete and recreate it? (y/n)"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Deleting existing cluster..."
    kind delete cluster --name "$CLUSTER_NAME"
  else
    echo "Using existing cluster. To start fresh, delete it first with:"
    echo "kind delete cluster --name $CLUSTER_NAME"
    exit 0
  fi
fi

# Create kind-config.yaml if it doesn't exist
if [ ! -f "kind-config.yaml" ]; then
  echo "Creating kind-config.yaml..."
  cat > kind-config.yaml << EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
- role: worker
EOF
  echo "Created kind-config.yaml with 1 control-plane node and 2 worker nodes"
fi

# Create the cluster
echo "Creating Kind cluster with config from kind-config.yaml..."
kind create cluster --name "$CLUSTER_NAME" --config kind-config.yaml

# Wait for cluster to be ready
echo "Waiting for cluster to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=120s

# Install ingress-nginx
echo "Installing ingress-nginx..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress-nginx to be ready
echo "Waiting for ingress-nginx to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Show cluster info
echo "Cluster info:"
kubectl cluster-info

# Show nodes
echo "Cluster nodes:"
kubectl get nodes

echo "================================================"
echo "Kind Kubernetes cluster '$CLUSTER_NAME' is ready!"
echo ""
echo "Next steps:"
echo "1. Build all services:         ./build-all.sh dev"
echo "2. Deploy services to cluster: ./deploy-all.sh dev"
echo ""
echo "To delete the cluster:         kind delete cluster --name $CLUSTER_NAME"
echo "================================================"
