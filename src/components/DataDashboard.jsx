import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function DataDashboard() {
  const [readings, setReadings] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 1. Initial Fetch
  const fetchLatestSensors = async () => {
    const { data, error } = await supabase
      .from('sensor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setReadings(data);
      setLastUpdate(new Date(data.created_at).toLocaleTimeString());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLatestSensors();

    // 2. REAL-TIME SUBSCRIPTION: Listen for new logs from the Raspberry Pi
    const sensorSubscription = supabase
      .channel('live-sensors')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'sensor_logs' }, 
        (payload) => {
          console.log('New sensor data received!', payload.new);
          setReadings(payload.new);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sensorSubscription);
    };
  }, []);

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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>LIVE SENSOR FEEDS</h3>
        <span style={{ fontSize: '0.7rem', color: '#27ae60', fontWeight: 'bold' }}>
          ● LIVE UPDATING (Last: {lastUpdate})
        </span>
      </div>

      <div className="iot-grid">
        {sensors.map((s, i) => {
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
    </div>
  );
}

export default DataDashboard;