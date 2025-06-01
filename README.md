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
- `charts/` - Helm charts

## Getting Started

See the [TODO.md](TODO.md) file for a step-by-step guide to setting up and using this lab environment.
