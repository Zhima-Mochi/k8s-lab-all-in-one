import React from 'react';

const NodeMetrics = ({ nodes = [] }) => {
  // Sort nodes by name
  const sortedNodes = [...nodes].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="card">
      <h2>Node Metrics</h2>
      
      {sortedNodes.length === 0 ? (
        <p>No node metrics available</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Node Name</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>CPU Usage</th>
              <th style={{ padding: '10px' }}>Memory Usage</th>
              <th style={{ padding: '10px' }}>Disk Usage</th>
            </tr>
          </thead>
          <tbody>
            {sortedNodes.map((node, index) => (
              <tr 
                key={node.name} 
                style={{ 
                  borderBottom: '1px solid #eee',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}
              >
                <td style={{ padding: '10px' }}>{node.name}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: node.status === 'Ready' ? '#dff0d8' : '#f2dede',
                    color: node.status === 'Ready' ? '#3c763d' : '#a94442',
                    fontWeight: 'bold'
                  }}>
                    {node.status || 'Unknown'}
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
                        width: `${node.cpuUsage || 0}%`, 
                        height: '100%', 
                        backgroundColor: getUsageColor(node.cpuUsage || 0)
                      }} />
                    </div>
                    <span style={{ marginLeft: '10px' }}>{node.cpuUsage || 0}%</span>
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
                        width: `${node.memoryUsage || 0}%`, 
                        height: '100%', 
                        backgroundColor: getUsageColor(node.memoryUsage || 0)
                      }} />
                    </div>
                    <span style={{ marginLeft: '10px' }}>{node.memoryUsage || 0}%</span>
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
                        width: `${node.diskUsage || 0}%`, 
                        height: '100%', 
                        backgroundColor: getUsageColor(node.diskUsage || 0)
                      }} />
                    </div>
                    <span style={{ marginLeft: '10px' }}>{node.diskUsage || 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Helper function to get color based on usage percentage
const getUsageColor = (percentage) => {
  if (percentage < 60) return '#2ecc71'; // Green
  if (percentage < 80) return '#f39c12'; // Orange
  return '#e74c3c'; // Red
};

export default NodeMetrics;
