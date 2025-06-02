import React, { useState } from 'react';

const PodMetrics = ({ pods = [] }) => {
  const [namespace, setNamespace] = useState('all');
  
  // Get unique namespaces from pods
  const namespaces = ['all', ...new Set(pods.map(pod => pod.namespace))];
  
  // Filter pods by selected namespace
  const filteredPods = namespace === 'all' 
    ? pods 
    : pods.filter(pod => pod.namespace === namespace);
  
  // Sort pods by name
  const sortedPods = [...filteredPods].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div>
      <div className="card">
        <h2>Pod Metrics</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="namespace-select" style={{ marginRight: '10px' }}>Namespace:</label>
          <select 
            id="namespace-select"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ddd' 
            }}
          >
            {namespaces.map(ns => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
        </div>
        
        {sortedPods.length === 0 ? (
          <p>No pod metrics available{namespace !== 'all' ? ` for namespace "${namespace}"` : ''}</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Pod Name</th>
                <th style={{ padding: '10px' }}>Namespace</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>CPU Usage</th>
                <th style={{ padding: '10px' }}>Memory Usage</th>
              </tr>
            </thead>
            <tbody>
              {sortedPods.map((pod, index) => (
                <tr 
                  key={`${pod.namespace}/${pod.name}`} 
                  style={{ 
                    borderBottom: '1px solid #eee',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                  }}
                >
                  <td style={{ padding: '10px' }}>{pod.name}</td>
                  <td style={{ padding: '10px' }}>{pod.namespace}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: getPodStatusColor(pod.status),
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {pod.status || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: '100px', 
                        height: '10px', 
                        backgroundColor: '#eee', 
                        borderRadius: '5px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${Math.min(pod.cpuUsage || 0, 100)}%`, 
                          height: '100%', 
                          backgroundColor: getUsageColor(pod.cpuUsage || 0)
                        }} />
                      </div>
                      <span style={{ marginLeft: '10px' }}>{pod.cpuUsage || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: '100px', 
                        height: '10px', 
                        backgroundColor: '#eee', 
                        borderRadius: '5px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${Math.min(pod.memoryUsage || 0, 100)}%`, 
                          height: '100%', 
                          backgroundColor: getUsageColor(pod.memoryUsage || 0)
                        }} />
                      </div>
                      <span style={{ marginLeft: '10px' }}>{pod.memoryUsage || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Helper function to get color based on usage percentage
const getUsageColor = (percentage) => {
  if (percentage < 60) return '#2ecc71'; // Green
  if (percentage < 80) return '#f39c12'; // Orange
  return '#e74c3c'; // Red
};

// Helper function to get color based on pod status
const getPodStatusColor = (status) => {
  switch (status) {
    case 'Running':
      return '#2ecc71'; // Green
    case 'Pending':
      return '#f39c12'; // Orange
    case 'Succeeded':
      return '#3498db'; // Blue
    case 'Failed':
      return '#e74c3c'; // Red
    case 'Unknown':
    default:
      return '#95a5a6'; // Gray
  }
};

export default PodMetrics;
