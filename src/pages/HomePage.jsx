import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { supabase } from '../supabaseClient';

function HomePage() {
  const [events, setEvents] = useState([]);

  // Fetch data from Supabase
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

  // Function to add new planting
  const plantKale = async () => {
    const { error } = await supabase.from('plantings').insert([{ crop_id: 1 }]);
    if (!error) fetchPlantings();
  };

  return (
    <div className="dashboard-home" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--primary-green)', margin: 0 }}>Farm Overview</h2>
        <button 
          onClick={plantKale}
          style={{ 
            background: 'var(--accent-gold)', 
            border: 'none', padding: '10px 20px', 
            borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
          }}
        >
          + Plant New Kale
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '30px' }}>
        
        {/* LEFT COLUMN: SYSTEM STATUS */}
        <div className="status-column">
           <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>SYSTEM STATUS</h3>
           <div style={{ background: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                 <span>Hydroponic Pump</span>
                 <strong style={{ color: 'var(--primary-green)' }}>● RUNNING</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span>Nutrient Solution</span>
                 <strong style={{ color: 'var(--accent-gold)' }}>● 65% CAPACITY</strong>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: LIVE CALENDAR */}
        <div className="calendar-column">
           <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>FARM CALENDAR</h3>
           <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #eee', minHeight: '500px' }}>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="500px"
                headerToolbar={{
                  left: 'prev,next',
                  center: 'title',
                  right: 'today'
                }}
              />
           </div>
        </div>

      </div>
    </div>
  );
}

export default HomePage;