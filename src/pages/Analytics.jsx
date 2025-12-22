// src/pages/Analytics.jsx (or Reports.jsx)
import React from 'react';
import DataDashboard from '../components/DataDashboard';

function Analytics() {
  return (
    <div className="analytics-container">
      <h2 style={{ color: 'var(--primary-green)', marginBottom: '25px' }}>
        Live Hydroponic Metrics
      </h2>
      {/* This calls the 9 parameters you wanted */}
      <DataDashboard /> 
    </div>
  );
}

export default Analytics;