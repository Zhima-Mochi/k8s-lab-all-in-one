# Metrics Frontend

A React-based dashboard for visualizing Kubernetes metrics from Prometheus.

## Features

- Cluster health overview
- Node metrics visualization
- Pod metrics visualization
- Service metrics visualization
- Real-time data updates (30-second polling)
- Mock data support for development without Prometheus

## Prerequisites

- Node.js 18+
- Docker (for containerization)
- Kubernetes cluster with Prometheus installed
- Optional: A Prometheus instance with Kubernetes metrics

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

   This will start the app in development mode at [http://localhost:3000](http://localhost:3000).

3. To use mock data instead of connecting to a real Prometheus instance:
   ```
   REACT_APP_USE_MOCK_DATA=true npm start
   ```

## Building and Deployment

### Docker Build

Build the Docker image:

```
docker build -t metrics:dev .
```

For production:

```
docker build -t metrics:latest .
```

### Kubernetes Deployment

The service can be deployed to Kubernetes using the provided manifests:

- Dev tier: `manifests/dev/metrics-deployment.yaml` and `manifests/dev/metrics-service.yaml`
- Standard tier: `manifests/standard/metrics-deployment.yaml` and `manifests/standard/metrics-service.yaml`
- HA tier: `manifests/ha/metrics-deployment.yaml` and `manifests/ha/metrics-service.yaml`

Deploy with kubectl:

```
kubectl apply -f manifests/dev/metrics-deployment.yaml
kubectl apply -f manifests/dev/metrics-service.yaml
```

## Configuration

The metrics dashboard can be configured using environment variables:

- `REACT_APP_PROMETHEUS_URL`: URL for the Prometheus API (default: `/api/v1`)
- `REACT_APP_USE_MOCK_DATA`: Set to "true" to use mock data instead of querying Prometheus (default: "false")

## Architecture

- React.js frontend
- Chart.js for data visualization
- Axios for API calls
- Responsive design with CSS Grid and Flexbox
- Mock data provider for development without Prometheus

## License

MIT
