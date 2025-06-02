import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ClusterOverview = ({ data = {} }) => {
  const { nodeCount, podCount, cpuUsage, memoryUsage, healthStatus, alertCount } = data;

  // CPU usage chart data
  const cpuChartData = {
    labels: ['Used', 'Available'],
    datasets: [
      {
        data: [cpuUsage || 0, 100 - (cpuUsage || 0)],
        backgroundColor: ['#3498db', '#ecf0f1'],
        borderColor: ['#2980b9', '#bdc3c7'],
        borderWidth: 1,
      },
    ],
  };

  // Memory usage chart data
  const memoryChartData = {
    labels: ['Used', 'Available'],
    datasets: [
      {
        data: [memoryUsage || 0, 100 - (memoryUsage || 0)],
        backgroundColor: ['#e74c3c', '#ecf0f1'],
        borderColor: ['#c0392b', '#bdc3c7'],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div>
      <div className="card">
        <h2>Cluster Health</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Status</h3>
            <div className={`metric-value ${healthStatus === 'Healthy' ? 'healthy' : 'warning'}`}>
              {healthStatus || 'Unknown'}
            </div>
            <p className="metric-description">Overall cluster health status</p>
          </div>
          
          <div className="metric-card">
            <h3>Nodes</h3>
            <div className="metric-value">{nodeCount || 0}</div>
            <p className="metric-description">Total number of nodes in the cluster</p>
          </div>
          
          <div className="metric-card">
            <h3>Pods</h3>
            <div className="metric-value">{podCount || 0}</div>
            <p className="metric-description">Total number of pods running in the cluster</p>
          </div>
          
          <div className="metric-card">
            <h3>Alerts</h3>
            <div className={`metric-value ${alertCount > 0 ? 'warning' : 'healthy'}`}>
              {alertCount || 0}
            </div>
            <p className="metric-description">Active alerts in the monitoring system</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Resource Utilization</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>CPU Usage</h3>
            <div style={{ height: '180px', position: 'relative' }}>
              <Doughnut data={cpuChartData} options={chartOptions} />
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                fontSize: '1.8rem',
                fontWeight: 'bold'
              }}>
                {cpuUsage || 0}%
              </div>
            </div>
            <p className="metric-description">Average CPU utilization across all nodes</p>
          </div>
          
          <div className="metric-card">
            <h3>Memory Usage</h3>
            <div style={{ height: '180px', position: 'relative' }}>
              <Doughnut data={memoryChartData} options={chartOptions} />
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                fontSize: '1.8rem',
                fontWeight: 'bold'
              }}>
                {memoryUsage || 0}%
              </div>
            </div>
            <p className="metric-description">Average memory utilization across all nodes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterOverview;
