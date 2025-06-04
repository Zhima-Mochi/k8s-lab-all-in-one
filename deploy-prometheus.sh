#!/bin/bash
set -e

# Script to deploy Prometheus to the Kubernetes cluster
echo "===== Deploying Prometheus to Kubernetes Cluster ====="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed or not in PATH"
    exit 1
fi

# Check if the cluster is running
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Cannot connect to Kubernetes cluster"
    echo "Please ensure your cluster is running and kubectl is configured correctly"
    exit 1
fi

echo "Creating monitoring namespace..."
kubectl apply -f manifests/prometheus/namespace.yaml

echo "Creating Prometheus RBAC..."
kubectl apply -f manifests/prometheus/prometheus-rbac.yaml

echo "Creating kube-state-metrics..."
kubectl apply -f manifests/prometheus/kube-state-metrics.yaml

echo "Creating Prometheus ConfigMap..."
kubectl apply -f manifests/prometheus/prometheus-configmap.yaml

echo "Deploying Prometheus..."
kubectl apply -f manifests/prometheus/prometheus-deployment.yaml

echo "Creating Prometheus Service..."
kubectl apply -f manifests/prometheus/prometheus-service.yaml

echo "Waiting for Prometheus deployment to be ready..."
kubectl -n monitoring rollout status deployment/prometheus

echo ""
echo "===== Prometheus Deployment Complete ====="
echo ""
echo "Prometheus is now running in the 'monitoring' namespace"
echo ""
echo "To access Prometheus UI, run the following command:"
echo "kubectl port-forward -n monitoring svc/prometheus 9090:9090"
echo ""
echo "Then open http://localhost:9090 in your browser"
echo ""
echo "To update your metrics service to use this Prometheus instance, update your .env file:"
echo "REACT_APP_PROMETHEUS_URL=http://prometheus.monitoring.svc.cluster.local:9090/api/v1"
echo "REACT_APP_USE_MOCK_DATA=false"
echo ""
