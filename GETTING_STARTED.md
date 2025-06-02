# Getting Started with K8s Lab All-in-One

This guide will walk you through setting up and using the complete Kubernetes lab environment.

## Prerequisites

Before starting, ensure you have the following installed:

- Docker Desktop (or Docker Engine)
- Go 1.22+
- Node.js 18+
- Python 3.11+
- kubectl
- kind (Kubernetes in Docker)
- Helm
- Optional: k9s for easier cluster management

## Quick Start

Here's a quick guide to get the entire lab environment up and running:

```bash
# 1. Set up a local Kubernetes cluster
./setup-cluster.sh

# 2. Build all microservices
./build-all.sh dev

# 3. Deploy all services to the development tier
./deploy-all.sh dev
```

## Step-by-Step Guide

### 1. Set Up the Kubernetes Cluster

Run the setup script to create a local Kind cluster with 3 nodes (1 control plane + 2 workers):

```bash
./setup-cluster.sh
```

This script will:
- Create a cluster named `k8s-lab-cluster` (or custom name if provided)
- Configure ingress-nginx
- Wait for all components to be ready

### 2. Build All Microservices

Build all the microservices with the development tag:

```bash
./build-all.sh dev
```

This builds:
- shortener (Go URL shortener)
- thumb (Node.js thumbnail generator)
- batch (Python FastAPI + Celery markdown processor)
- echo (Rust WebSocket echo server)
- metrics (React metrics dashboard)

For production builds, use:

```bash
./build-all.sh prod
```

### 3. Deploy Services

Deploy all services to the development tier:

```bash
./deploy-all.sh dev
```

Or deploy to other tiers:

```bash
./deploy-all.sh standard
./deploy-all.sh ha
```

### 4. Access the Services

Use port-forwarding to access the services:

```bash
# URL Shortener service
kubectl port-forward svc/shortener 8000:80

# Thumbnail service
kubectl port-forward svc/thumb 8001:80

# Batch API service
kubectl port-forward svc/batch-api 8002:80

# Echo WebSocket service
kubectl port-forward svc/echo 8003:8080

# Metrics Dashboard
kubectl port-forward svc/metrics 8004:80
```

## Understanding the Services

### URL Shortener Service (Go)

A simple URL shortening service with:
- Create short URLs
- Redirect to original URLs
- List all URLs

Example:
```bash
# Create a short URL
curl -X POST http://localhost:8000/shorten -d '{"url": "https://kubernetes.io"}'

# Access the short URL
curl -L http://localhost:8000/abc123
```

### Thumbnail Service (Node.js)

Generates thumbnails from images:
- Upload an image
- Get a thumbnail in different sizes

Example:
```bash
# Upload an image
curl -X POST -F "image=@./my-image.jpg" http://localhost:8001/upload

# Get a thumbnail
curl http://localhost:8001/thumb/abc123?size=200
```

### Batch Processor (Python + Redis + Celery)

Converts Markdown to HTML asynchronously:
- Submit a markdown document
- Check job status
- Get the processed HTML

Example:
```bash
# Submit a job
curl -X POST -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello World\n\nThis is a **test**"}' \
  http://localhost:8002/convert

# Check status
curl http://localhost:8002/status/job123

# Get result
curl http://localhost:8002/result/job123
```

### Echo WebSocket Service (Rust)

Simple WebSocket echo server:
- Connect via WebSocket
- Send messages and receive echoes back

Testing:
- Access http://localhost:8003 in your browser
- Use the built-in WebSocket client

### Metrics Dashboard (React)

Monitoring dashboard for the Kubernetes cluster:
- Cluster overview
- Node metrics
- Pod metrics
- Service metrics

Access: http://localhost:8004

## Experimenting with Different Tiers

This lab environment provides three deployment tiers:

1. **Dev Tier**: Single replica, minimal resources
   ```bash
   ./deploy-all.sh dev
   ```

2. **Standard Tier**: 2 replicas, moderate resources
   ```bash
   ./deploy-all.sh standard
   ```

3. **HA Tier**: 3 replicas, pod anti-affinity, higher resources
   ```bash
   ./deploy-all.sh ha
   ```

## Troubleshooting

### Common Issues

1. **Images not found in Kind cluster**
   
   Solution: Ensure you've built and loaded the images:
   ```bash
   ./build-all.sh dev
   ```

2. **Services not starting**
   
   Check pod status and logs:
   ```bash
   kubectl get pods
   kubectl logs pod/pod-name
   ```

3. **Port conflicts**
   
   Change the host port in the port-forward commands if you have conflicts.

## Next Steps

After you've got the basic environment running, you can:

1. Experiment with resource limits
2. Set up Horizontal Pod Autoscalers
3. Add Prometheus and Grafana for monitoring
4. Explore node affinity and anti-affinity
5. Create custom Helm charts

Refer to the TODO.md file for more advanced ideas to explore.
