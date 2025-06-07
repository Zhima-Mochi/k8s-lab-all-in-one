# k8s-lab-all-in-one 2.0

A plug-and-play sandbox for comparing resource configurations and usage for different project types on Kubernetes.

## Overview

This project aims to provide a streamlined environment to:
- Launch local or cloud Kubernetes clusters.
- Deploy various workload types (Web, API, Batch, MQ-Consumer, ML-Job).
- Automatically set up observability stacks (Prometheus, Grafana, Loki, Tempo).
- Generate reproducible load patterns.
- Export metrics for analysis.

## Prerequisites

- Docker
- Go 1.22+
- Node 18+
- Python 3.11+
- kubectl
- kind
- Helm
- k9s (optional)

## Project Structure (v2.0)

```
k8s-lab-all-in-one/
├── apps/                  # Source code or Dockerfile for workloads
│   ├── web-go/
│   ├── api-node/
│   ├── batch-python/
│   ├── mq-consumer-java/
│   └── ml-job-pytorch/
├── charts/                # Helm Charts for each application
│   └── web-go/
├── infra/                 # Infrastructure setup (kind, minikube, EKS)
│   ├── kind/
│   ├── minikube/
│   └── eks/
├── observability/         # Monitoring, logging, tracing configurations
│   ├── prometheus-stack/
│   ├── loki-stack/
│   └── grafana-dashboards/
├── load/                  # Load testing scripts
│   ├── k6/
│   └── stress/
├── scripts/               # Utility scripts
│   ├── up-kind.sh
│   ├── load-test.sh
│   └── export-metrics.py
├── .github/workflows/     # CI/CD workflows
│   └── ci.yaml
└── README.md
```

## Getting Started

(To be updated for v2.0)

For the original project (v1), see [README.v1.md](README.v1.md) (once created).
