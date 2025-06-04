# K8s Lab All-in-One

A local multi-service Kubernetes lab environment for experimenting with K8s resources in a safe sandbox.

## Overview

This project allows you to spin up a local multi-service lab that lets you experiment with Kubernetes resource configurations in a controlled environment.

## Prerequisites

- Docker Desktop (or CLI)
- Go 1.22+
- Node 18+
- Python 3.11+
- kubectl
- kind
- Helm
- k9s (optional)

## Project Structure

- `services/` - Microservice implementations
  - `shortener/` - URL shortener service (Go)
  - `thumb/` - Thumbnail service (Node.js + Sharp)
  - `batch/` - Markdown batch processor (FastAPI + Celery + Redis)
  - `echo/` - WebSocket echo service (Rust Actix)
  - `metrics/` - Metrics frontend (React + Prometheus API)
- `manifests/` - Kubernetes manifests
  - `dev/` - Development tier configurations
  - `standard/` - Standard tier configurations
  - `ha/` - High availability tier configurations
  - `prometheus/` - Prometheus monitoring stack manifests (namespace, RBAC, kube-state-metrics, ConfigMap, Deployment, Service)
- `charts/` - Helm charts
- `deploy-prometheus.sh` - Script to deploy the Prometheus monitoring stack
- Other helper scripts (`setup-cluster.sh`, `build-all.sh`, `deploy-all.sh`, `cleanup.sh`, etc.)

## Getting Started

See the [Getting Started guide](GETTING_STARTED.md) for step-by-step instructions on setting up, deploying, and monitoring the lab environment.
