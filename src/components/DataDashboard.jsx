import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function DataDashboard() {
  const [readings, setReadings] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Fetch the latest sensor readings from Supabase
  const fetchLatestSensors = async () => {
    const { data, error } = await supabase
      .from('sensor_logs') // Ensure you have this table
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setReadings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLatestSensors();
    // Optional: Set up an interval to refresh every 30 seconds
    const interval = setInterval(fetchLatestSensors, 30000);
    return () => clearInterval(interval);
  }, []);

  // Configuration for your 9 Hydroponic Sensors
  const sensors = [
    { label: 'Water pH', value: readings.ph || '5.8', unit: 'pH', min: 5.5, max: 6.5 },
    { label: 'EC Level', value: readings.ec || '1.4', unit: 'mS/cm', min: 1.2, max: 2.0 },
    { label: 'Water Temp', value: readings.w_temp || '22', unit: '°C', min: 18, max: 24 },
    { label: 'Water Level', value: readings.w_level || '85', unit: '%', min: 20, max: 100 },
    { label: 'Dissolved O₂', value: readings.do2 || '8.2', unit: 'mg/L', min: 5.0, max: 10.0 },
    { label: 'TDS (PPM)', value: readings.tds || '700', unit: 'ppm', min: 500, max: 1200 },
    { label: 'Air Temp', value: readings.a_temp || '26', unit: '°C', min: 20, max: 30 },
    { label: 'Air Humidity', value: readings.humidity || '60', unit: '%', min: 40, max: 70 },
    { label: 'Light (PPFD)', value: readings.ppfd || '450', unit: 'μmol', min: 300, max: 800 }
  ];

  if (loading) return <div style={{color: '#888', padding: '20px'}}>Connecting to Pi CM4...</div>;

  return (
    <div className="iot-grid">
      {sensors.map((s, i) => {
        // Productivity Logic: Check if value is out of healthy range
        const isAlert = parseFloat(s.value) < s.min || parseFloat(s.value) > s.max;
        
        return (
          <div key={i} className="iot-card" style={{ border: isAlert ? '1px solid #ff7675' : '1px solid #eee' }}>
            <div 
              className="iot-icon-bar" 
              style={{ backgroundColor: isAlert ? '#ff7675' : (i % 2 === 0 ? 'var(--accent-gold)' : 'var(--primary-green)') }}
            ></div>
            <div className="iot-info">
              <span className="iot-label">
                {s.label} {isAlert && <span title="Out of Range">⚠️</span>}
              </span>
              <div className="iot-value" style={{ color: isAlert ? '#d63031' : 'inherit' }}>
                {s.value}<span className="iot-unit">{s.unit}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DataDashboard;