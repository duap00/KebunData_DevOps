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

  useEffect(() => {
    fetchInitialData();
    fetchBatches();
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
          title: `[${step.name.toUpperCase()}] ${c?.name}`,
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
  const deleteBatch = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this batch?");
    if (confirmDelete) {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchBatches();
      } else {
        alert("Error deleting batch: " + error.message);
      }
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      
      {/* TOP SECTION: Matches your old code's grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '25px' }}>
        
        {/* NEW BATCH FORM */}
        <div style={cardStyle}>
          <h3 style={labelStyle}>🚀 NEW BATCH</h3>
          <label style={miniLabel}>CROP:</label>
          <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} style={inputStyle}>
            <option value="">-- Select --</option>
            {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label style={miniLabel}>STATION:</label>
          <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} style={inputStyle}>
            <option value="">-- Select --</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button onClick={async () => {
            const { error } = await supabase.from('batches').insert([{ crop_id: selectedCrop, location_id: selectedLocation, quantity: 1, status: 'sowing', sown_date: new Date().toISOString() }]);
            if (!error) fetchBatches();
          }} style={btnStyle}>Initialize Cycle</button>
        </div>

        {/* CALENDAR: SET TO YOUR PREFERRED HEIGHT */}
        <div style={cardStyle}>
          <FullCalendar 
            plugins={[dayGridPlugin, timeGridPlugin]} 
            initialView="dayGridMonth" 
            events={events} 
            height="auto"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridDay' }}
          />
        </div>
      </div>

      {/* BOTTOM SECTION: Map & Pipelines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '20px' }}>
        <div style={cardStyle}>
          <h4 style={labelStyle}>📍 FARM MAP</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {locations.map(loc => {
              const b = batches.find(batch => batch.location_id === loc.id);
              return (
                <div key={loc.id} style={{ ...stationBox, borderBottom: `4px solid ${getStatusColor(b?.status)}` }}>
                   <div style={{fontSize:'0.6rem'}}>{loc.name}</div>
                   <div style={{fontWeight:'bold'}}>{b ? b.crops?.name : 'Empty'}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={cardStyle}>
          <h4 style={labelStyle}>📋 STAGING</h4>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {STAGES.map(stage => (
              <div key={stage} style={columnStyle}>
                <div style={{ ...stageHeader, background: getStatusColor(stage) }}>{stage}</div>
                {batches.filter(b => b.status === stage).map(b => (
  <div key={b.id} style={batchItem}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontWeight: 'bold' }}>{b.crops?.name}</span>
      <span style={{ fontSize: '0.6rem', color: '#999' }}>ID: {b.id.toString().slice(0,4)}</span>
    </div>
    <div style={{ display: 'flex', gap: '4px' }}>
      {/* DELETE BUTTON */}
      <button 
        onClick={() => deleteBatch(b.id)} 
        style={{ ...nextBtn, color: 'red', fontWeight: 'bold' }}
      >
        ✕
      </button>
      {/* MOVE BUTTON */}
      <button onClick={() => moveStatus(b)} style={nextBtn}>⮕</button>
    </div>
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

// STYLES TO MATCH OLD LOOK
const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const labelStyle = { margin: '0 0 15px 0', fontSize: '0.8rem', color: '#888', letterSpacing: '1px' };
const miniLabel = { fontSize: '0.7rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' };
const btnStyle = { width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' };
const stationBox = { padding: '10px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' };
const columnStyle = { flex: '0 0 120px', background: '#f4f4f4', borderRadius: '8px', minHeight: '150px' };
const stageHeader = { padding: '4px', color: 'white', fontSize: '0.6rem', textAlign: 'center', fontWeight: 'bold' };
const batchItem = { background: 'white', margin: '5px', padding: '8px', borderRadius: '5px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' };
const nextBtn = { border: 'none', background: '#eee', borderRadius: '3px', cursor: 'pointer' };

export default FarmDashboard;