import axios from 'axios';

// Set base URL for Prometheus API - this will be configured to use the Kubernetes service
const baseURL = process.env.REACT_APP_PROMETHEUS_URL || '/api/v1';

// Create axios instance for Prometheus API
const prometheusAPI = axios.create({
  baseURL,
  timeout: 10000,
});

// Mock data for development without Prometheus
const useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true';

// Fetch cluster health metrics
export const fetchClusterHealth = async () => {
  if (useMockData) {
    return {
      nodeCount: 3,
      podCount: 15,
      cpuUsage: 28.4,
      memoryUsage: 42.7,
      healthStatus: 'Healthy',
      alertCount: 0,
    };
  }

  try {
    // Get nodes count
    const nodeCountQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'count(kube_node_info)',
      },
    });
    
    // Get pods count
    const podCountQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'count(kube_pod_info)',
      },
    });
    
    // Get cluster CPU usage
    const cpuUsageQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'sum(rate(node_cpu_seconds_total{mode!="idle"}[5m])) / sum(rate(node_cpu_seconds_total[5m])) * 100',
      },
    });
    
    // Get cluster memory usage
    const memoryUsageQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'sum(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / sum(node_memory_MemTotal_bytes) * 100',
      },
    });
    
    // Get alerts count
    const alertCountQuery = await prometheusAPI.get('/alerts');
    
    // Process and return data
    const nodeCount = nodeCountQuery.data.data.result[0]?.value[1] || 0;
    const podCount = podCountQuery.data.data.result[0]?.value[1] || 0;
    const cpuUsage = parseFloat(cpuUsageQuery.data.data.result[0]?.value[1] || 0).toFixed(1);
    const memoryUsage = parseFloat(memoryUsageQuery.data.data.result[0]?.value[1] || 0).toFixed(1);
    const alertCount = alertCountQuery.data.data.alerts.length || 0;
    
    return {
      nodeCount: parseInt(nodeCount),
      podCount: parseInt(podCount),
      cpuUsage: parseFloat(cpuUsage),
      memoryUsage: parseFloat(memoryUsage),
      healthStatus: alertCount > 0 ? 'Warning' : 'Healthy',
      alertCount,
    };
  } catch (error) {
    console.error('Error fetching cluster health:', error);
    throw error;
  }
};

// Fetch node metrics
export const fetchNodeMetrics = async () => {
  if (useMockData) {
    return [
      { name: 'node1', cpuUsage: 35.2, memoryUsage: 48.7, diskUsage: 28.9, status: 'Ready' },
      { name: 'node2', cpuUsage: 24.6, memoryUsage: 42.1, diskUsage: 31.5, status: 'Ready' },
      { name: 'node3', cpuUsage: 18.3, memoryUsage: 37.4, diskUsage: 25.8, status: 'Ready' },
    ];
  }

  try {
    // Get node CPU usage
    const cpuQuery = await prometheusAPI.get('/query', {
      params: {
        query: '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
      },
    });
    
    // Get node memory usage
    const memoryQuery = await prometheusAPI.get('/query', {
      params: {
        query: '(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100',
      },
    });
    
    // Get node disk usage
    const diskQuery = await prometheusAPI.get('/query', {
      params: {
        query: '(node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_free_bytes{mountpoint="/"}) / node_filesystem_size_bytes{mountpoint="/"} * 100',
      },
    });
    
    // Get node status
    const statusQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'kube_node_status_condition{condition="Ready",status="true"}',
      },
    });
    
    // Process results
    const nodes = {};
    
    // Process CPU metrics
    cpuQuery.data.data.result.forEach(item => {
      const nodeName = item.metric.instance;
      if (!nodes[nodeName]) {
        nodes[nodeName] = { name: nodeName };
      }
      nodes[nodeName].cpuUsage = parseFloat(item.value[1]).toFixed(1);
    });
    
    // Process memory metrics
    memoryQuery.data.data.result.forEach(item => {
      const nodeName = item.metric.instance;
      if (!nodes[nodeName]) {
        nodes[nodeName] = { name: nodeName };
      }
      nodes[nodeName].memoryUsage = parseFloat(item.value[1]).toFixed(1);
    });
    
    // Process disk metrics
    diskQuery.data.data.result.forEach(item => {
      const nodeName = item.metric.instance;
      if (!nodes[nodeName]) {
        nodes[nodeName] = { name: nodeName };
      }
      nodes[nodeName].diskUsage = parseFloat(item.value[1]).toFixed(1);
    });
    
    // Process status
    statusQuery.data.data.result.forEach(item => {
      const nodeName = item.metric.node;
      if (!nodes[nodeName]) {
        nodes[nodeName] = { name: nodeName };
      }
      nodes[nodeName].status = 'Ready';
    });
    
    return Object.values(nodes);
  } catch (error) {
    console.error('Error fetching node metrics:', error);
    throw error;
  }
};

// Fetch pod metrics
export const fetchPodMetrics = async () => {
  if (useMockData) {
    return [
      { name: 'shortener-123abc', namespace: 'default', cpuUsage: 12.1, memoryUsage: 25.3, status: 'Running' },
      { name: 'batch-api-456def', namespace: 'default', cpuUsage: 8.7, memoryUsage: 32.6, status: 'Running' },
      { name: 'batch-worker-789ghi', namespace: 'default', cpuUsage: 15.3, memoryUsage: 41.9, status: 'Running' },
      { name: 'thumb-321cba', namespace: 'default', cpuUsage: 9.2, memoryUsage: 28.5, status: 'Running' },
      { name: 'echo-654fed', namespace: 'default', cpuUsage: 4.8, memoryUsage: 18.2, status: 'Running' },
      { name: 'redis-987ihg', namespace: 'default', cpuUsage: 7.5, memoryUsage: 22.8, status: 'Running' },
    ];
  }

  try {
    // Get pod CPU usage
    const cpuQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'sum by (pod, namespace) (rate(container_cpu_usage_seconds_total{container!="POD",container!=""}[5m])) * 100',
      },
    });
    
    // Get pod memory usage
    const memoryQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'sum by (pod, namespace) (container_memory_working_set_bytes{container!="POD",container!=""}) / sum by (pod, namespace) (container_spec_memory_limit_bytes{container!="POD",container!=""}) * 100',
      },
    });
    
    // Get pod status
    const statusQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'kube_pod_status_phase',
      },
    });
    
    // Process results
    const pods = {};
    
    // Process CPU metrics
    cpuQuery.data.data.result.forEach(item => {
      const podName = item.metric.pod;
      const namespace = item.metric.namespace;
      const podKey = `${namespace}/${podName}`;
      
      if (!pods[podKey]) {
        pods[podKey] = { name: podName, namespace };
      }
      pods[podKey].cpuUsage = parseFloat(item.value[1]).toFixed(1);
    });
    
    // Process memory metrics
    memoryQuery.data.data.result.forEach(item => {
      const podName = item.metric.pod;
      const namespace = item.metric.namespace;
      const podKey = `${namespace}/${podName}`;
      
      if (!pods[podKey]) {
        pods[podKey] = { name: podName, namespace };
      }
      pods[podKey].memoryUsage = parseFloat(item.value[1]).toFixed(1);
    });
    
    // Process status
    statusQuery.data.data.result.forEach(item => {
      const podName = item.metric.pod;
      const namespace = item.metric.namespace;
      const phase = item.metric.phase;
      const value = item.value[1];
      
      if (value === '1') {
        const podKey = `${namespace}/${podName}`;
        if (!pods[podKey]) {
          pods[podKey] = { name: podName, namespace };
        }
        pods[podKey].status = phase;
      }
    });
    
    return Object.values(pods);
  } catch (error) {
    console.error('Error fetching pod metrics:', error);
    throw error;
  }
};

// Fetch service metrics
export const fetchServiceMetrics = async () => {
  if (useMockData) {
    return [
      { name: 'shortener', namespace: 'default', requestRate: 32.5, errorRate: 0.7, latency: 112 },
      { name: 'batch-api', namespace: 'default', requestRate: 12.1, errorRate: 0, latency: 230 },
      { name: 'thumb', namespace: 'default', requestRate: 18.6, errorRate: 1.2, latency: 184 },
      { name: 'echo', namespace: 'default', requestRate: 8.3, errorRate: 0.1, latency: 56 },
    ];
  }

  try {
    // Get service request rate
    const requestRateQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'sum by (service, namespace) (rate(http_requests_total[5m]))',
      },
    });
    
    // Get service error rate
    const errorRateQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'sum by (service, namespace) (rate(http_requests_total{status=~"5.."}[5m])) / sum by (service, namespace) (rate(http_requests_total[5m])) * 100',
      },
    });
    
    // Get service latency
    const latencyQuery = await prometheusAPI.get('/query', {
      params: {
        query: 'histogram_quantile(0.95, sum by (service, namespace, le) (rate(http_request_duration_seconds_bucket[5m])))',
      },
    });
    
    // Process results
    const services = {};
    
    // Process request rate
    requestRateQuery.data.data.result.forEach(item => {
      const serviceName = item.metric.service;
      const namespace = item.metric.namespace;
      const serviceKey = `${namespace}/${serviceName}`;
      
      if (!services[serviceKey]) {
        services[serviceKey] = { name: serviceName, namespace };
      }
      services[serviceKey].requestRate = parseFloat(item.value[1]).toFixed(1);
    });
    
    // Process error rate
    errorRateQuery.data.data.result.forEach(item => {
      const serviceName = item.metric.service;
      const namespace = item.metric.namespace;
      const serviceKey = `${namespace}/${serviceName}`;
      
      if (!services[serviceKey]) {
        services[serviceKey] = { name: serviceName, namespace };
      }
      services[serviceKey].errorRate = parseFloat(item.value[1]).toFixed(1);
    });
    
    // Process latency
    latencyQuery.data.data.result.forEach(item => {
      const serviceName = item.metric.service;
      const namespace = item.metric.namespace;
      const serviceKey = `${namespace}/${serviceName}`;
      
      if (!services[serviceKey]) {
        services[serviceKey] = { name: serviceName, namespace };
      }
      // Convert to milliseconds
      services[serviceKey].latency = Math.round(parseFloat(item.value[1]) * 1000);
    });
    
    return Object.values(services);
  } catch (error) {
    console.error('Error fetching service metrics:', error);
    throw error;
  }
};
