import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { supabase } from '../supabaseClient';
import './calendar-styles.css';
import '@fullcalendar/react/dist/vdom';

function HomePage() {
  const [events, setEvents] = useState([]);

  // Fetch real data from Supabase
  const fetchPlantings = async () => {
    const { data, error } = await supabase
      .from('plantings')
      .select('*, crops(name)');

    if (data) {
      const formatted = data.map(p => ({
        title: `🌱 Harvest: ${p.crops?.name || 'Kale'}`,
        start: p.harvest_date, 
        backgroundColor: '#D4AF37', 
        borderColor: '#D4AF37',
        textColor: '#000'
      }));
      setEvents(formatted);
    }
  };

  useEffect(() => { fetchPlantings(); }, []);

  return (
    <div className="home-page" style={{ padding: '20px', color: 'white' }}>
      <h1>Farm Overview</h1>
      
      {/* SYSTEM STATUS SECTION */}
      <div className="status-grid" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div className="status-card">
          <p>SYSTEM STATUS</p>
          <h3>Hydroponic Pump</h3>
          <span style={{ color: '#00ff00' }}>● RUNNING</span>
        </div>
        <div className="status-card">
          <p>Nutrient Solution</p>
          <h3>65% CAPACITY</h3>
          <span style={{ color: '#D4AF37' }}>● STABLE</span>
        </div>
      </div>

      <hr style={{ borderColor: '#333', marginBottom: '30px' }} />

      {/* REAL FARM CALENDAR SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>FARM CALENDAR</h2>
        <button onClick={async () => {
            await supabase.from('plantings').insert([{ crop_id: 1 }]);
            fetchPlantings();
        }} style={{ backgroundColor: '#D4AF37', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
          + Plant Kale
        </button>
      </div>

      <div className="calendar-container" style={{ marginTop: '20px' }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="600px"
        />
      </div>
    </div>
  );
}

export default HomePage;