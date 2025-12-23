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
    const { data, error } = await supabase
      .from('batches')
      .select(`*, crops:crop_id (*)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch Error:", error.message);
      return;
    }

    if (data) {
      console.log("New data received:", data.length, "items");
      setBatches([...data]); 
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
        step.days < 0.1 
          ? endDate.setMinutes(currentStartDate.getMinutes() + (step.days * 1440)) 
          : endDate.setDate(currentStartDate.getDate() + step.days);
        
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
    return colors[s?.toLowerCase()] || '#ddd';
  };

  const moveStatus = async (batch) => {
    const currentStatus = batch.status.toLowerCase().trim();
    const currentIndex = STAGES.indexOf(currentStatus);
    
    if (currentIndex >= STAGES.length - 1) return;

    const nextStatus = STAGES[currentIndex + 1];
    
    const { error } = await supabase
      .from('batches')
      .update({ status: nextStatus })
      .eq('id', batch.id);

    if (error) {
      alert("Failed to move: " + error.message);
    } else {
      await fetchBatches(); 
    }
  }; 

  const deleteBatch = async (id) => {
    if (window.confirm("Are you sure you want to remove this batch?")) {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', id);
      
      if (!error) {
        await fetchBatches();
      } else {
        alert("Error deleting batch: " + error.message);
      }
    }
  };

  const createBatch = async () => {
    if (!selectedCrop || !selectedLocation) {
        alert("Please select both Crop and Station");
        return;
    }
    const { error } = await supabase.from('batches').insert([
        { 
            crop_id: selectedCrop, 
            location_id: selectedLocation, 
            quantity: 1, 
            status: 'sowing', 
            sown_date: new Date().toISOString() 
        }
    ]);
    if (!error) {
        setSelectedCrop('');
        setSelectedLocation('');
        await fetchBatches();
    }
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '25px' }}>
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
          <button onClick={createBatch} style={btnStyle}>Initialize Cycle</button>
        </div>

        <div style={cardStyle}>
          <FullCalendar 
            plugins={[dayGridPlugin, timeGridPlugin]} 
            initialView="dayGridMonth" 
            events={events} 
            height="400px"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridDay' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '20px' }}>
        <div style={cardStyle}>
          <h4 style={labelStyle}>📍 FARM MAP</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {locations.map(loc => {
              const b = batches.find(batch => batch.location_id === loc.id);
              return (
                <div key={loc.id} style={{ ...stationBox, borderBottom: `4px solid ${getStatusColor(b?.status)}` }}>
                   <div style={{fontSize:'0.6rem', color: '#666'}}>{loc.name}</div>
                   <div style={{fontWeight:'bold'}}>{b ? b.crops?.name : 'Empty'}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={cardStyle}>
          <h4 style={labelStyle}>📋 STAGING PIPELINE</h4>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {STAGES.map(stage => (
              <div key={stage} style={columnStyle}>
                <div style={{ ...stageHeader, background: getStatusColor(stage) }}>{stage.toUpperCase()}</div>
                {batches.filter(b => b.status?.toLowerCase() === stage).map(b => (
                  <div key={b.id} style={batchItem}>
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '70%' }}>
                      <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.crops?.name}</span>
                      <span style={{ fontSize: '0.6rem', color: '#999' }}>ID: {b.id.toString().slice(0,4)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button onClick={() => deleteBatch(b.id)} style={{ ...nextBtn, color: '#e74c3c' }}>✕</button>
                      <button onClick={() => moveStatus(b)} style={{ ...nextBtn, color: '#2ecc71' }}>⮕</button>
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

const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const labelStyle = { margin: '0 0 15px 0', fontSize: '0.8rem', color: '#888', letterSpacing: '1px', fontWeight: 'bold' };
const miniLabel = { fontSize: '0.7rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' };
const btnStyle = { width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' };
const stationBox = { padding: '10px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center', minHeight: '50px' };
const columnStyle = { flex: '0 0 140px', background: '#f4f7f6', borderRadius: '10px', minHeight: '250px', border: '1px solid #e0e0e0' };
const stageHeader = { padding: '8px', color: 'white', fontSize: '0.7rem', textAlign: 'center', fontWeight: 'bold', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' };
const batchItem = { background: 'white', margin: '8px', padding: '10px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' };
const nextBtn = { border: 'none', background: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default FarmDashboard;