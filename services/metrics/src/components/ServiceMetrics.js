import React, { useState, useEffect } from 'react';
import { fetchServiceMetrics } from '../services/prometheus';

const ServiceMetrics = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getServiceMetrics = async () => {
      try {
        setLoading(true);
        const data = await fetchServiceMetrics();
        setServices(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching service metrics:', err);
        setError('Failed to fetch service metrics');
      } finally {
        setLoading(false);
      }
    };

    getServiceMetrics();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      getServiceMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Sort services by name
  const sortedServices = [...services].sort((a, b) => a.name.localeCompare(b.name));

  if (loading && services.length === 0) {
    return (
      <div className="card">
        <h2>Service Metrics</h2>
        <div className="loading">Loading service metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Service Metrics</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Service Metrics</h2>

      {sortedServices.length === 0 ? (
        <p>No service metrics available</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Service Name</th>
              <th style={{ padding: '10px' }}>Namespace</th>
              <th style={{ padding: '10px' }}>Request Rate</th>
              <th style={{ padding: '10px' }}>Error Rate</th>
              <th style={{ padding: '10px' }}>Latency (P95)</th>
            </tr>
          </thead>
          <tbody>
            {sortedServices.map((service, index) => (
              <tr 
                key={`${service.namespace}/${service.name}`} 
                style={{ 
                  borderBottom: '1px solid #eee',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}
              >
                <td style={{ padding: '10px' }}>{service.name}</td>
                <td style={{ padding: '10px' }}>{service.namespace}</td>
                <td style={{ padding: '10px' }}>
                  {service.requestRate || '0'} req/s
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    color: getErrorRateColor(service.errorRate || 0),
                    fontWeight: 'bold'
                  }}>
                    {service.errorRate || '0'}%
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    color: getLatencyColor(service.latency || 0),
                    fontWeight: 'bold'
                  }}>
                    {service.latency || '0'} ms
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Helper function to get color based on error rate
const getErrorRateColor = (errorRate) => {
  if (errorRate < 1) return '#2ecc71'; // Green
  if (errorRate < 5) return '#f39c12'; // Orange
  return '#e74c3c'; // Red
};

// Helper function to get color based on latency
const getLatencyColor = (latency) => {
  if (latency < 100) return '#2ecc71'; // Green
  if (latency < 300) return '#f39c12'; // Orange
  return '#e74c3c'; // Red
};

export default ServiceMetrics;
