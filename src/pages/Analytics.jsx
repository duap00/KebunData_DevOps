import React from 'react';
import DataDashboard from '../components/DataDashboard';

function Analytics() {
  // Check if screen is mobile for padding adjustments
  const isMobile = window.innerWidth < 768;

  return (
    <div className="analytics-container" style={{ 
      padding: isMobile ? '10px' : '20px',
      maxWidth: '100vw',
      overflowX: 'hidden' 
    }}>
      <h2 style={{ 
        color: '#27ae60', 
        marginBottom: '20px',
        fontSize: isMobile ? '1.2rem' : '1.8rem',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        Live Hydroponic Metrics
      </h2>
      
      {/* Pro Tip: Inside your DataDashboard component, 
         ensure the grid is: grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      */}
      <div style={{ width: '100%' }}>
        <DataDashboard /> 
      </div>
    </div>
  );
}

export default Analytics;