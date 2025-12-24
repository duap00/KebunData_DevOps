import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function DataDashboard() {
  const [data, setData] = useState(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    fetchLatestData();
    // Real-time subscription for live CM4 updates
    const sub = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_logs' }, 
        payload => setData(payload.new)
      )
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const fetchLatestData = async () => {
    const { data } = await supabase
      .from('sensor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (data) setData(data[0]);
  };

  if (!data) return <div style={{ textAlign: 'center', padding: '20px' }}>Connecting to CM4 Sensors...</div>;

  // Helper to render a card with color safety zones
  const SensorCard = ({ label, value, unit, min, max, color }) => {
    const isOutRange = value < min || value > max;
    return (
      <div style={{
        ...cardStyle,
        borderTop: `5px solid ${isOutRange ? '#e74c3c' : color}`,
        background: isOutRange ? '#fff5f5' : 'white'
      }}>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{value}<span style={unitStyle}>{unit}</span></div>
        <div style={{ fontSize: '0.65rem', color: isOutRange ? '#e74c3c' : '#999' }}>
          {isOutRange ? '⚠️ CHECK SYSTEM' : `Target: ${min}-${max}`}
        </div>
      </div>
    );
  };

  return (
    <div style={containerGrid}>
      <SensorCard label="Water pH" value={data.ph} unit="" min={5.5} max={6.5} color="#3498db" />
      <SensorCard label="EC (Nutrients)" value={data.ec} unit=" mS" min={1.2} max={2.5} color="#f1c40f" />
      <SensorCard label="Water Temp" value={data.water_temp} unit="°C" min={18} max={24} color="#2ecc71" />
      <SensorCard label="Room Temp" value={data.air_temp} unit="°C" min={22} max={28} color="#e67e22" />
      <SensorCard label="Humidity" value={data.humidity} unit="%" min={40} max={70} color="#9b59b6" />
      <SensorCard label="CO2 Level" value={data.co2} unit=" ppm" min={400} max={1200} color="#1abc9c" />
      <SensorCard label="Light" value={data.lux} unit=" lux" min={5000} max={15000} color="#f39c12" />
      <SensorCard label="TDS" value={data.tds} unit=" ppm" min={600} max={1200} color="#34495e" />
      <SensorCard label="Water Level" value={data.water_level} unit="%" min={20} max={100} color="#2980b9" />
    </div>
  );
}

// --- RESPONSIVE STYLES ---
const containerGrid = {
  display: 'grid',
  // On mobile: 2 columns. On tablet: 3 columns. On desktop: 4-5 columns.
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '12px',
  width: '100%'
};

const cardStyle = {
  padding: '15px 10px',
  borderRadius: '12px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  textAlign: 'center',
  transition: 'transform 0.2s'
};

const labelStyle = { fontSize: '0.7rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', marginBottom: '5px' };
const valueStyle = { fontSize: '1.6rem', fontWeight: 'bold', color: '#2c3e50' };
const unitStyle = { fontSize: '0.8rem', marginLeft: '2px', color: '#7f8c8d' };

export default DataDashboard;