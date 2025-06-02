import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchClusterHealth, fetchNodeMetrics, fetchPodMetrics } from './services/prometheus';
import ClusterOverview from './components/ClusterOverview';
import NodeMetrics from './components/NodeMetrics';
import PodMetrics from './components/PodMetrics';
import ServiceMetrics from './components/ServiceMetrics';

function App() {
  const [activeTab, setActiveTab] = useState('cluster');
  const [clusterData, setClusterData] = useState({});
  const [nodeData, setNodeData] = useState([]);
  const [podData, setPodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch initial data
        const clusterHealth = await fetchClusterHealth();
        const nodeMetrics = await fetchNodeMetrics();
        const podMetrics = await fetchPodMetrics();

        setClusterData(clusterHealth);
        setNodeData(nodeMetrics);
        setPodData(podMetrics);
        setError(null);
      } catch (err) {
        console.error('Error fetching metrics data:', err);
        setError('Failed to fetch metrics data. Please check if Prometheus is accessible.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (loading && !clusterData.nodeCount) {
      return <div className="loading">Loading metrics data...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    switch (activeTab) {
      case 'cluster':
        return <ClusterOverview data={clusterData} />;
      case 'nodes':
        return <NodeMetrics nodes={nodeData} />;
      case 'pods':
        return <PodMetrics pods={podData} />;
      case 'services':
        return <ServiceMetrics />;
      default:
        return <ClusterOverview data={clusterData} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kubernetes Metrics Dashboard</h1>
        <div className="navigation">
          <button 
            className={activeTab === 'cluster' ? 'active' : ''} 
            onClick={() => setActiveTab('cluster')}
          >
            Cluster Overview
          </button>
          <button 
            className={activeTab === 'nodes' ? 'active' : ''} 
            onClick={() => setActiveTab('nodes')}
          >
            Node Metrics
          </button>
          <button 
            className={activeTab === 'pods' ? 'active' : ''} 
            onClick={() => setActiveTab('pods')}
          >
            Pod Metrics
          </button>
          <button 
            className={activeTab === 'services' ? 'active' : ''} 
            onClick={() => setActiveTab('services')}
          >
            Service Metrics
          </button>
        </div>
      </header>

      <main className="app-content">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>K8s Lab Metrics Dashboard - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
