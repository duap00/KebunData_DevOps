import React, { useEffect, useState } from 'react';
import DataDashboard from '../components/DataDashboard';
import { supabase } from '../supabaseClient';

function Analytics() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    // Fetch last 10 completed batches from history
    const { data, error } = await supabase
      .from('batch_history')
      .select('*')
      .order('harvest_date', { ascending: false })
      .limit(10);

    if (error) console.error("Error fetching history:", error);
    if (data) setHistory(data);
    setLoading(false);
  };

  return (
    <div className="analytics-container" style={{ padding: isMobile ? '10px' : '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#2c4035', marginBottom: '20px', fontWeight: '800' }}>📊 Analytics & History</h2>
      
      {/* 1. LIVE METRICS (Your existing charts/gauges) */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={sectionLabel}>Real-Time Sensor Data</h3>
        <DataDashboard /> 
      </section>

      {/* 2. BATCH HISTORY TABLE */}
      <section style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ ...sectionLabel, margin: 0 }}>Completed Batches</h3>
          <button onClick={fetchHistory} style={refreshBtn}>↻ Refresh History</button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #eee' }}>
                <th style={thStyle}>Crop Name</th>
                <th style={thStyle}>Station</th>
                <th style={thStyle}>Growing Days</th>
                <th style={thStyle}>Harvested On</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#27ae60' }}>{item.crop_name}</td>
                  <td style={tdStyle}>{item.location_name}</td>
                  <td style={tdStyle}>{item.total_days} Days</td>
                  <td style={tdStyle}>{new Date(item.harvest_date).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    {loading ? "Fetching records..." : "No archived batches found yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// STYLES
const sectionLabel = { fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '15px' };
const cardStyle = { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' };
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.75rem', color: '#475569' };
const tdStyle = { padding: '15px', fontSize: '0.85rem', color: '#1e293b' };
const refreshBtn = { background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' };

export default Analytics;