import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function CropSettings() {
  const [crops, setCrops] = useState([]);
  const [newCropName, setNewCropName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('crops')
      .select(`*, crop_parameters (*)`)
      .order('name');
    
    if (data) {
      const normalizedData = data.map(c => ({
        ...c,
        params: c.crop_parameters && c.crop_parameters.length > 0 
          ? c.crop_parameters[0] 
          : { ph_min: 5.5, ph_max: 6.5, ec_min: 1.2, ec_max: 1.8, temp_min: 22, temp_max: 28 }
      }));
      setCrops(normalizedData);
    }
    setLoading(false);
  };

  const addCrop = async (e) => {
    e.preventDefault();
    if (!newCropName) return;
    setLoading(true);
    const { data: newCrop } = await supabase.from('crops').insert([{ name: newCropName }]).select().single();
    if (newCrop) {
      await supabase.from('crop_parameters').insert([{ 
        crop_id: newCrop.id, ph_min: 5.5, ph_max: 6.5, ec_min: 1.2, ec_max: 1.8, temp_min: 22, temp_max: 28 
      }]);
      setNewCropName('');
      fetchCrops();
    }
    setLoading(false);
  };

  const handleChange = (id, field, value, isParam = false) => {
    const updatedCrops = crops.map(c => {
      if (c.id === id) {
        if (isParam) return { ...c, params: { ...c.params, [field]: value } };
        return { ...c, [field]: value };
      }
      return c;
    });
    setCrops(updatedCrops);
  };

  const saveRow = async (crop) => {
    setLoading(true);
    const p = crop.params;
    const { error: err1 } = await supabase.from('crops').update({
      germination_days: parseFloat(crop.germination_days) || 0,
      vegetative_days: parseFloat(crop.vegetative_days) || 0
    }).eq('id', crop.id);

    const { error: err2 } = await supabase.from('crop_parameters').upsert({
      crop_id: crop.id,
      ph_min: parseFloat(p.ph_min), ph_max: parseFloat(p.ph_max),
      ec_min: parseFloat(p.ec_min), ec_max: parseFloat(p.ec_max),
      temp_min: parseFloat(p.temp_min), temp_max: parseFloat(p.temp_max)
    }, { onConflict: 'crop_id' });

    if (!err1 && !err2) alert(`✅ Saved ${crop.name}`);
    else alert("Save failed.");
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#27ae60', fontWeight: '800' }}>🌱 Master Crop Library</h2>
        {loading && <span style={{ fontSize: '0.8rem', color: '#888' }}>⚡ Syncing...</span>}
      </div>

      <div style={addBoxStyle}>
        <form onSubmit={addCrop} style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Add new variety..." value={newCropName} onChange={e => setNewCropName(e.target.value)} style={inputStyle}/>
          <button type="submit" style={addBtnStyle}>+ Add Crop</button>
        </form>
      </div>

      <div style={tableContainer}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
          <thead>
            <tr style={headerStyle}>
              <th style={{ ...thStyle, width: '200px' }}>Variety Name</th>
              <th style={thStyle}>Germination</th>
              <th style={thStyle}>Vegetative</th>
              <th style={{ ...thStyle, color: '#27ae60' }}>pH Range</th>
              <th style={{ ...thStyle, color: '#2980b9' }}>EC Range</th>
              <th style={{ ...thStyle, color: '#e67e22' }}>Temp Range</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {crops.map(crop => (
              <tr key={crop.id} style={rowStyle}>
                <td style={{ fontWeight: 'bold', padding: '15px', color: '#2c3e50' }}>{crop.name}</td>
                <td style={tdStyle}><input type="number" value={crop.germination_days ?? ''} onChange={e => handleChange(crop.id, 'germination_days', e.target.value)} style={dayInput}/> <span style={unit}>d</span></td>
                <td style={tdStyle}><input type="number" value={crop.vegetative_days ?? ''} onChange={e => handleChange(crop.id, 'vegetative_days', e.target.value)} style={dayInput}/> <span style={unit}>d</span></td>
                
                {/* PH SECTION - WIDER BOXES */}
                <td style={tdStyle}>
                  <div style={inputGroup}>
                    <input type="number" step="0.1" value={crop.params?.ph_min ?? ''} onChange={e => handleChange(crop.id, 'ph_min', e.target.value, true)} style={paramInput}/>
                    <span style={dash}>-</span>
                    <input type="number" step="0.1" value={crop.params?.ph_max ?? ''} onChange={e => handleChange(crop.id, 'ph_max', e.target.value, true)} style={paramInput}/>
                  </div>
                </td>

                {/* EC SECTION */}
                <td style={tdStyle}>
                  <div style={inputGroup}>
                    <input type="number" step="0.1" value={crop.params?.ec_min ?? ''} onChange={e => handleChange(crop.id, 'ec_min', e.target.value, true)} style={paramInput}/>
                    <span style={dash}>-</span>
                    <input type="number" step="0.1" value={crop.params?.ec_max ?? ''} onChange={e => handleChange(crop.id, 'ec_max', e.target.value, true)} style={paramInput}/>
                  </div>
                </td>

                {/* TEMP SECTION */}
                <td style={tdStyle}>
                  <div style={inputGroup}>
                    <input type="number" value={crop.params?.temp_min ?? ''} onChange={e => handleChange(crop.id, 'temp_min', e.target.value, true)} style={paramInput}/>
                    <span style={dash}>-</span>
                    <input type="number" value={crop.params?.temp_max ?? ''} onChange={e => handleChange(crop.id, 'temp_max', e.target.value, true)} style={paramInput}/>
                  </div>
                </td>

                <td style={tdStyle}>
                  <button onClick={() => saveRow(crop)} style={saveBtn}>SAVE DATA</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// STYLES - UPDATED FOR WIDTH
const addBoxStyle = { background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #eee' };
const inputStyle = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const addBtnStyle = { padding: '12px 25px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const tableContainer = { background: 'white', borderRadius: '12px', border: '1px solid #eee', overflowX: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const headerStyle = { background: '#f8f9fa', borderBottom: '2px solid #eee', textAlign: 'left' };
const thStyle = { padding: '15px', fontSize: '0.7rem', textTransform: 'uppercase', color: '#666', letterSpacing: '1px' };
const tdStyle = { padding: '10px 15px', borderBottom: '1px solid #f9f9f9' };
const rowStyle = { borderBottom: '1px solid #eee' };

// INCREASED WIDTHS HERE
const dayInput = { width: '55px', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center' };
const paramInput = { 
  width: '65px', // INCREASED FROM 45px
  padding: '8px', 
  border: '1px solid #e2e8f0', 
  borderRadius: '6px', 
  textAlign: 'center',
  fontSize: '0.9rem',
  fontWeight: '500'
};
const inputGroup = { display: 'flex', alignItems: 'center', gap: '5px' };
const dash = { color: '#cbd5e1', fontWeight: 'bold' };
const unit = { fontSize: '0.7rem', color: '#94a3b8', marginLeft: '3px' };
const saveBtn = { background: '#2c3e50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', width: '110px' };

export default CropSettings;