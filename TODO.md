# K8s Lab All-in-One: Step-by-Step To-Do List

## 0. Prerequisites
- [ ] Verify Docker is installed (`docker --version`)
- [ ] Verify Go 1.22+ is installed (`go version`)
- [ ] Verify Node 18+ is installed (`node -v`)
- [ ] Verify Python 3.11+ is installed (`python -V`)
- [ ] Verify kubectl is installed (`kubectl version --o json`)
- [ ] Verify kind is installed (`kind version`)
- [ ] Verify Helm is installed (`helm version`)
- [ ] Optional: Verify k9s is installed (`k9s version`)

## 1. Bootstrap the Repository
- [x] Create directory and initialize git (already done)
- [x] Create directory structure:
  - [x] `services/shortener`
  - [x] `services/thumb`
  - [x] `services/batch`
  - [x] `services/echo`
  - [x] `services/metrics`
  - [x] `manifests/dev`
  - [x] `manifests/standard`
  - [x] `manifests/ha`
  - [x] `charts/`
  - [x] `README.md`

## 2. Build the Shortener API Service
- [x] Create Go module and get dependencies
- [x] Write basic API code in `main.go`
- [x] Create Dockerfile
- [x] Build Docker image
- [ ] Commit and push changes

## 3. Create Kubernetes Manifests
- [x] Write deployment manifest for shortener service
- [x] Write service manifest for shortener service
- [x] Place manifests in `manifests/dev/`
- [x] Create standard and ha tier manifests

## 4. Create Local Multi-Node Cluster
- [x] Create Kind cluster configuration file
- [x] Spin up a 3-node Kind cluster

## 5. Deploy First Service
- [x] Load shortener image into Kind cluster
- [x] Apply shortener manifests
- [x] Verify deployment with `kubectl get pods`
- [x] Test the service with port-forward and curl

## 6. Implement Additional Services
- [ ] Build thumb-service (Node.js + Sharp)
- [ ] Build markdown-batch (FastAPI + Celery + Redis)
- [ ] Build echo-ws (Rust Actix)
- [ ] Build metrics-frontend (React + Prometheus API)
- [ ] Create Dockerfiles for each service
- [ ] Write K8s manifests for each service

## 7. Resource Experimentation
- [ ] Adjust resource limits to observe OOMKilled/throttling
- [ ] Implement Horizontal Pod Autoscaler
- [ ] Create node pools with labels
- [ ] Implement nodeSelector and tolerations

## 8. Add Observability
- [ ] Install Prometheus and Grafana using Helm
- [ ] Configure dashboards for monitoring
- [ ] Set up alerts for resource constraints

## 9. Cloud Deployment (Optional)
- [ ] Set up Terraform for AWS EKS or GKE
- [ ] Configure container registry
- [ ] Test with spot instances

## 10. Extend and Automate
- [ ] Write load testing scripts
- [ ] Parameterize manifests with Helm
- [ ] Set up GitHub Actions workflow
