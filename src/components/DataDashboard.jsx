import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function DataDashboard() {
  const [data, setData] = useState(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    fetchLatestData();
    
    // Live subscription (will work once CM4 starts pushing data)
    const sub = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_logs' }, 
        payload => setData(payload.new)
      )
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const fetchLatestData = async () => {
    const { data: dbData, error } = await supabase
      .from('sensor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (dbData && dbData.length > 0) {
      setData(dbData[0]);
    } else {
      // --- DUMMY DATA SIMULATION ---
      // This shows if your database is empty or CM4 is offline
      setData({
        ph: 6.8,          // High pH (Will trigger red alert)
        ec: 1.8,          // Normal
        water_temp: 22.5, // Normal
        air_temp: 28.5,   // Slightly High
        humidity: 65,     // Normal
        co2: 850,         // Good
        lux: 12500,       // Bright
        tds: 900,         // Normal
        water_level: 85   // Good
      });
    }
  };

  if (!data) return <div style={{ textAlign: 'center', padding: '40px' }}>Initializing Sensors...</div>;

  // Helper component for the cards
  const SensorCard = ({ label, value, unit, min, max, color }) => {
    const isOutRange = value < min || value > max;
    return (
      <div style={{
        padding: '15px',
        borderRadius: '16px',
        background: isOutRange ? '#fff5f5' : 'white',
        border: '1px solid #eee',
        borderTop: `5px solid ${isOutRange ? '#ff4d4d' : color}`,
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        textAlign: 'center',
        transition: '0.3s'
      }}>
        <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isOutRange ? '#d32f2f' : '#2c3e50' }}>
          {value}<span style={{ fontSize: '0.9rem', color: '#999' }}>{unit}</span>
        </div>
        <div style={{ fontSize: '0.6rem', marginTop: '5px', color: isOutRange ? '#d32f2f' : '#bbb' }}>
          {isOutRange ? '⚠️ OUT OF RANGE' : `Target: ${min}-${max}`}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '15px',
      width: '100%'
    }}>
      <SensorCard label="pH Level" value={data.ph} unit="" min={5.5} max={6.5} color="#3498db" />
      <SensorCard label="EC Level" value={data.ec} unit=" mS" min={1.2} max={2.5} color="#f1c40f" />
      <SensorCard label="Water Temp" value={data.water_temp} unit="°C" min={18} max={24} color="#2ecc71" />
      <SensorCard label="Air Temp" value={data.air_temp} unit="°C" min={22} max={28} color="#e67e22" />
      <SensorCard label="Humidity" value={data.humidity} unit="%" min={40} max={70} color="#9b59b6" />
      <SensorCard label="CO2" value={data.co2} unit=" ppm" min={400} max={1200} color="#1abc9c" />
      <SensorCard label="Light" value={data.lux} unit=" lux" min={5000} max={15000} color="#f39c12" />
      <SensorCard label="TDS" value={data.tds} unit=" ppm" min={600} max={1200} color="#34495e" />
      <SensorCard label="Reservoir" value={data.water_level} unit="%" min={50} max={100} color="#2980b9" />
    </div>
  );
}

export default DataDashboard;