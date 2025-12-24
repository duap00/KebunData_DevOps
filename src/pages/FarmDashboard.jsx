import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import { supabase } from '../supabaseClient';

const STAGES = ['sowing', 'seedling', 'germination', 'vegetative', 'harvest', 'packaging'];

function FarmDashboard() {
  const [events, setEvents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [crops, setCrops] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  // Track window width for responsive adjustments within the dashboard
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    fetchInitialData();
    fetchBatches();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchInitialData = async () => {
    const { data: cropData } = await supabase.from('crops').select('*');
    const { data: locData } = await supabase.from('locations').select('*');
    if (cropData) setCrops(cropData);
    if (locData) setLocations(locData);
  };

  const fetchBatches = async () => {
    const { data } = await supabase.from('batches').select(`*, crops:crop_id (*)`);
    if (data) {
      setBatches(data);
      generateTimeline(data);
    }
  };

  const generateTimeline = (allBatches) => {
    let timelineEvents = [];
    allBatches.forEach(batch => {
      const c = batch.crops; 
      let currentStartDate = new Date(batch.sown_date || new Date());
      const sequence = [
        { name: 'sowing', days: c?.sowing_days || 0.02 },
        { name: 'seedling', days: c?.seedling_days || 3 },
        { name: 'germination', days: c?.germination_days || 7 },
        { name: 'vegetative', days: c?.vegetative_days || 21 }
      ];

      sequence.forEach(step => {
        const endDate = new Date(currentStartDate);
        step.days < 0.1 ? endDate.setMinutes(currentStartDate.getMinutes() + (step.days * 1440)) : endDate.setDate(currentStartDate.getDate() + step.days);
        timelineEvents.push({
          title: `${c?.name || 'Crop'}`,
          start: currentStartDate.toISOString(),
          end: endDate.toISOString(),
          backgroundColor: getStatusColor(step.name),
          borderColor: 'transparent',
        });
        currentStartDate = new Date(endDate);
      });
    });
    setEvents(timelineEvents);
  };

  const getStatusColor = (s) => {
    const colors = { sowing: '#8e44ad', seedling: '#3498db', germination: '#f1c40f', vegetative: '#27ae60', harvest: '#e67e22', packaging: '#2c3e50' };
    return colors[s] || '#ddd';
  };

  const moveStatus = async (batch) => {
    const currentIndex = STAGES.indexOf(batch.status);
    if (currentIndex >= STAGES.length - 1) return;
    const nextStatus = STAGES[currentIndex + 1];
    const { error } = await supabase.from('batches').update({ status: nextStatus }).eq('id', batch.id);
    if (!error) fetchBatches();
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      
      {/* RESPONSIVE GRID: 1 column on mobile, 2 columns on desktop */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', 
        gap: '20px', 
        marginBottom: '25px' 
      }}>
        
        {/* NEW BATCH FORM */}
        <div style={cardStyle}>
          <h3 style={labelStyle}>🚀 NEW BATCH</h3>
          <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} style={inputStyle}>
            <option value="">-- Select Crop --</option>
            {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} style={inputStyle}>
            <option value="">-- Select Station --</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button onClick={async () => {
            const { error } = await supabase.from('batches').insert([{ crop_id: selectedCrop, location_id: selectedLocation, quantity: 1, status: 'sowing', sown_date: new Date().toISOString() }]);
            if (!error) fetchBatches();
          }} style={btnStyle}>Initialize Cycle</button>
        </div>

        {/* CALENDAR */}
        <div style={cardStyle}>
          <FullCalendar 
            plugins={[dayGridPlugin, timeGridPlugin]} 
            initialView={isMobile ? "timeGridDay" : "dayGridMonth"} 
            events={events} 
            height={isMobile ? 450 : 400} 
            headerToolbar={{ 
                left: 'prev,next', 
                center: 'title', 
                right: isMobile ? '' : 'dayGridMonth,timeGridDay' 
            }}
          />
        </div>
      </div>

      {/* FARM MAP & PIPELINE: Stack vertically on mobile */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 2.5fr', 
        gap: '20px' 
      }}>
        {/* MAP */}
        <div style={cardStyle}>
          <h4 style={labelStyle}>📍 FARM MAP</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '10px' 
          }}>
            {locations.map(loc => {
              const b = batches.find(batch => batch.location_id === loc.id);
              return (
                <div key={loc.id} style={{ ...stationBox, borderBottom: `4px solid ${getStatusColor(b?.status)}` }}>
                   <div style={{fontSize:'0.65rem', color: '#888'}}>{loc.name}</div>
                   <div style={{fontWeight:'bold', fontSize: '0.85rem'}}>{b ? b.crops?.name : 'Empty'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STAGING PIPELINE: Horizontal Scroll on Mobile */}
        <div style={cardStyle}>
          <h4 style={labelStyle}>📋 STAGING</h4>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            overflowX: 'auto', 
            paddingBottom: '10px',
            WebkitOverflowScrolling: 'touch' 
          }}>
            {STAGES.map(stage => (
              <div key={stage} style={columnStyle}>
                <div style={{ ...stageHeader, background: getStatusColor(stage) }}>{stage}</div>
                {batches.filter(b => b.status === stage).map(b => (
                  <div key={b.id} style={batchItem}>
                    <span style={{fontWeight: '500'}}>{b.crops?.name}</span>
                    <button onClick={() => moveStatus(b)} style={nextBtn}>⮕</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const cardStyle = { background: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const labelStyle = { margin: '0 0 12px 0', fontSize: '0.75rem', color: '#999', letterSpacing: '1px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' };
const btnStyle = { width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const stationBox = { padding: '12px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' };
const columnStyle = { flex: '0 0 130px', background: '#f8f9fa', borderRadius: '8px', minHeight: '120px' };
const stageHeader = { padding: '6px', color: 'white', fontSize: '0.65rem', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' };
const batchItem = { background: 'white', margin: '6px', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const nextBtn = { border: 'none', background: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' };

export default FarmDashboard;