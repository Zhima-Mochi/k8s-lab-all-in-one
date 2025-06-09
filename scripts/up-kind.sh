#!/bin/bash
# This script sets up the kind cluster, installs observability tools, and deploys specified applications.

set -e # Exit immediately if a command exits with a non-zero status.

KIND_CONFIG_PATH="../infra/kind/kind-config.yaml"
CLUSTER_NAME=$(grep "name:" "$KIND_CONFIG_PATH" | sed 's/name: //') # Extract cluster name from config
PROMETHEUS_STACK_VALUES_PATH="../observability/prometheus-stack/values.yaml"
MONITORING_NAMESPACE="monitoring"

echo "🚀 Starting k8s-lab setup..."

# 1. Create kind cluster if it doesn't exist
if ! kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
  echo "Cluster '${CLUSTER_NAME}' not found. Creating it now with config: ${KIND_CONFIG_PATH}..."
  kind create cluster --config="${KIND_CONFIG_PATH}"
  echo "✅ Kind cluster '${CLUSTER_NAME}' created."
else
  echo "Cluster '${CLUSTER_NAME}' already exists. Skipping creation."
fi

# Set kubectl context to the new cluster (or existing one)
kubectl cluster-info --context "kind-${CLUSTER_NAME}"

# 2. Install kube-prometheus-stack
echo "📊 Setting up kube-prometheus-stack..."

# Add Prometheus community Helm repo
if ! helm repo list | grep -q "prometheus-community"; then
  echo "Adding prometheus-community Helm repository..."
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
else
  echo "Prometheus-community Helm repository already added."
fi
helm repo update

# Create monitoring namespace if it doesn't exist
if ! kubectl get namespace "${MONITORING_NAMESPACE}" > /dev/null 2>&1; then
  echo "Creating namespace '${MONITORING_NAMESPACE}'..."
  kubectl create namespace "${MONITORING_NAMESPACE}"
else
  echo "Namespace '${MONITORING_NAMESPACE}' already exists."
fi

# Apply Grafana dashboard ConfigMaps
GRAFANA_DASHBOARDS_DIR="../observability/grafana-dashboards"
if [ -d "${GRAFANA_DASHBOARDS_DIR}" ]; then
  echo "Applying Grafana dashboard ConfigMaps from ${GRAFANA_DASHBOARDS_DIR}..."
  for cm_file in "${GRAFANA_DASHBOARDS_DIR}"/*-cm.yaml; do
    if [ -f "${cm_file}" ]; then
      echo "  Applying ${cm_file}..."
      kubectl apply -f "${cm_file}" --namespace "${MONITORING_NAMESPACE}"
    fi
  done
else
  echo "ℹ️ Grafana dashboards directory ${GRAFANA_DASHBOARDS_DIR} not found. Skipping dashboard ConfigMap application."
fi

# Install or upgrade kube-prometheus-stack
# Release name for prometheus stack
PROM_STACK_RELEASE_NAME="prom-stack"
echo "Installing/Upgrading kube-prometheus-stack release '${PROM_STACK_RELEASE_NAME}' in namespace '${MONITORING_NAMESPACE}'..."
helm upgrade --install "${PROM_STACK_RELEASE_NAME}" prometheus-community/kube-prometheus-stack \
  --namespace "${MONITORING_NAMESPACE}" \
  -f "${PROMETHEUS_STACK_VALUES_PATH}" \
  --wait # Wait for components to be ready

echo "✅ kube-prometheus-stack setup complete."

APP_IMAGE_TAG="latest" # Using a consistent tag for locally built images

if [ "$#" -eq 0 ]; then
  echo "ℹ️ No applications specified for deployment. Skipping app build and deploy."
else
  echo "🏗️ Building application Docker images and loading into kind..."
  for app in "$@"; do
    echo "  Processing application: ${app}..."
    APP_SOURCE_DIR="../apps/${app}"
    APP_CHART_DIR="../charts/${app}"
    IMAGE_NAME="k8s-lab/${app}:${APP_IMAGE_TAG}"

    if [ ! -d "${APP_SOURCE_DIR}" ]; then
      echo "    ⚠️ Warning: Application source directory ${APP_SOURCE_DIR} not found. Skipping ${app} build/load."
      continue
    fi
    if [ ! -f "${APP_SOURCE_DIR}/Dockerfile" ]; then
      echo "    ⚠️ Warning: Dockerfile not found in ${APP_SOURCE_DIR}. Skipping ${app} build/load."
      continue
    fi

    # Build Docker image
    echo "    Building Docker image ${IMAGE_NAME} from ${APP_SOURCE_DIR}..."
    docker build -t "${IMAGE_NAME}" "${APP_SOURCE_DIR}"
    
    # Load image into kind cluster
    echo "    Loading image ${IMAGE_NAME} into kind cluster '${CLUSTER_NAME}'..."
    kind load docker-image "${IMAGE_NAME}" --name "${CLUSTER_NAME}"
    
    echo "  ✅ Image for ${app} built and loaded."
  done

  echo "📦 Deploying applications via Helm..."
  for app in "$@"; do
    echo "  Deploying application: ${app}..."
    APP_CHART_DIR="../charts/${app}"
    APP_NAMESPACE="default" # Deploying to default namespace for simplicity

    if [ ! -d "${APP_CHART_DIR}" ]; then
      echo "    ⚠️ Warning: Chart directory ${APP_CHART_DIR} not found. Skipping ${app} deployment."
      continue
    fi

    # Helm deploy/upgrade
    echo "    Helm upgrading/installing ${app} from ${APP_CHART_DIR} into namespace ${APP_NAMESPACE}..."
    helm upgrade --install "${app}" "${APP_CHART_DIR}" \
      --namespace "${APP_NAMESPACE}" \
      --create-namespace \
      --set image.repository="k8s-lab/${app}" \
      --set image.tag="${APP_IMAGE_TAG}" \
      --set image.pullPolicy="IfNotPresent" # Important for Kind to use local images
      # --wait # Optional: wait for Helm release to be ready
      
    echo "  ✅ ${app} deployment initiated."
  done
fi

echo "🎉 k8s-lab setup finished!"
