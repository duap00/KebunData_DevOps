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
    const { data } = await supabase.from('batches').select(`*, crops:crop_id (*), locations:location_id (*)`);
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
        step.days < 0.1 
          ? endDate.setMinutes(currentStartDate.getMinutes() + (step.days * 1440)) 
          : endDate.setDate(currentStartDate.getDate() + step.days);
        
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

  const archiveBatch = async (batch) => {
    const startDate = new Date(batch.sown_date);
    const endDate = new Date();
    const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));

    const { error: histError } = await supabase.from('batch_history').insert([{
      batch_id: batch.id,
      crop_name: batch.crops?.name,
      location_name: locations.find(l => l.id === batch.location_id)?.name || 'Unknown',
      sown_date: batch.sown_date,
      harvest_date: endDate.toISOString(),
      total_days: diffDays,
      status: 'completed'
    }]);

    if (!histError) {
      await supabase.from('batches').delete().eq('id', batch.id);
      fetchBatches();
      alert(`🎉 ${batch.crops?.name} archived!`);
    }
  };

  const moveStatus = async (batch) => {
    const currentIndex = STAGES.indexOf(batch.status);
    const nextStatus = STAGES[currentIndex + 1];

    // TRANSPLANT LOGIC: This happens AFTER Germination as you enter Vegetative
    if (batch.status === 'germination') {
      const selectElement = document.getElementById(`tower-select-${batch.id}`);
      const selectedTowerId = selectElement ? selectElement.value : null;

      if (!selectedTowerId) {
        alert("Please select the target ZipGrow or Aeroponic tower before transplanting!");
        return;
      }

      const { error } = await supabase
        .from('batches')
        .update({ status: nextStatus, location_id: selectedTowerId })
        .eq('id', batch.id);

      if (!error) fetchBatches();
      return;
    }

    if (currentIndex === STAGES.length - 1) {
      return archiveBatch(batch);
    }

    const { error } = await supabase.from('batches').update({ status: nextStatus }).eq('id', batch.id);
    if (!error) fetchBatches();
  };

  const removeBatch = async (id, name) => {
    if (window.confirm(`Permanently remove ${name} batch?`)) {
      const { error } = await supabase.from('batches').delete().eq('id', id);
      if (!error) fetchBatches();
    }
  };

  return (
    <div style={{ padding: isMobile ? '10px' : '20px', paddingBottom: '50px' }}>
      {/* NEW BATCH & CALENDAR ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '20px', marginBottom: '25px' }}>
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
            if (!error) { fetchBatches(); setSelectedCrop(''); setSelectedLocation(''); }
          }} style={btnStyle}>Initialize Cycle</button>
        </div>
        <div style={cardStyle}>
          <FullCalendar plugins={[dayGridPlugin, timeGridPlugin]} initialView={isMobile ? "timeGridDay" : "dayGridMonth"} events={events} height={isMobile ? 450 : 400} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2.5fr', gap: '20px' }}>
        <div style={cardStyle}>
          <h4 style={labelStyle}>📍 FARM MAP</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
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

        <div style={cardStyle}>
          <h4 style={labelStyle}>📋 PIPELINE</h4>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '15px' }}>
            {STAGES.map(stage => (
              <div key={stage} style={columnStyle}>
                <div style={{ ...stageHeader, background: getStatusColor(stage) }}>{stage}</div>
                {batches.filter(b => b.status === stage).map(b => (
                  <div key={b.id} style={batchItem}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{fontWeight: '700', color: '#2c3e50'}}>{b.crops?.name}</span>
                      
                      {/* ONLY SHOW DROPDOWN WHEN BATCH REACHES GERMINATION (PREPARING FOR VEGETATIVE) */}
                      {b.status === 'germination' && (
                        <div style={{marginTop: '5px'}}>
                          <label style={{fontSize: '0.6rem', color: '#666', fontWeight: 'bold'}}>TRANSPLANT TO:</label>
                          <select id={`tower-select-${b.id}`} style={smallDropdownStyle}>
                            <option value="">Select Tower...</option>
                            {locations
                              .filter(loc => 
                                loc.name.toLowerCase().includes('zipgrow') || 
                                loc.name.toLowerCase().includes('aeroponics')
                              )
                              .map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                              ))}
                          </select>
                        </div>
                      )}

                      <button onClick={() => removeBatch(b.id, b.crops?.name)} style={smallRemoveBtn}>Remove</button>
                    </div>
                    <button onClick={() => moveStatus(b)} style={{...nextBtn, background: b.status === 'packaging' ? '#2c3e50' : '#e8f5e9', color: b.status === 'packaging' ? 'white' : '#2e7d32'}}>
                      {b.status === 'packaging' ? '🏁' : '⮕'}
                    </button>
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

const cardStyle = { background: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #eee' };
const labelStyle = { margin: '0 0 12px 0', fontSize: '0.75rem', color: '#999', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const btnStyle = { width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const stationBox = { padding: '12px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' };
const columnStyle = { flex: '0 0 170px', background: '#f8f9fa', borderRadius: '8px', minHeight: '220px' };
const stageHeader = { padding: '8px', color: 'white', fontSize: '0.7rem', textAlign: 'center', fontWeight: 'bold', borderRadius: '8px 8px 0 0' };
const batchItem = { background: 'white', margin: '8px', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f0f0f0' };
const nextBtn = { border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '6px 10px', fontWeight: 'bold' };
const smallRemoveBtn = { background: 'none', border: 'none', color: '#ff4d4f', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, textAlign: 'left', marginTop: '5px' };
const smallDropdownStyle = { fontSize: '0.7rem', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', backgroundColor: '#fff', marginTop: '2px' };

export default FarmDashboard;