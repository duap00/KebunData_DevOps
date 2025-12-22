import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function CropSettings() {
  const [crops, setCrops] = useState([]);
  const [newCropName, setNewCropName] = useState('');

  useEffect(() => { fetchCrops(); }, []);

  const fetchCrops = async () => {
    const { data } = await supabase.from('crops').select('*').order('name');
    if (data) setCrops(data);
  };

  // 1. ADD NEW CROP FUNCTION
  const addCrop = async (e) => {
    e.preventDefault();
    if (!newCropName) return;

    const { error } = await supabase.from('crops').insert([{ 
      name: newCropName,
      sowing_days: 0.02,     // Default 30 mins
      seedling_days: 3,      // Default 3 days
      germination_days: 7,
      vegetative_days: 21,
      harvest_days: 2,
      packaging_days: 1
    }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setNewCropName('');
      fetchCrops();
      alert(`${newCropName} added to library!`);
    }
  };

  const handleUpdate = async (id, field, value) => {
    await supabase.from('crops').update({ [field]: parseFloat(value) }).eq('id', id);
    fetchCrops();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#27ae60' }}>🌱 Crop Library & Parameters</h2>

      {/* ADD NEW CROP FORM */}
      <div style={addBoxStyle}>
        <form onSubmit={addCrop} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '0.8rem', display: 'block' }}>New Crop Name:</label>
            <input 
              type="text" 
              placeholder="e.g. Spinach" 
              value={newCropName} 
              onChange={e => setNewCropName(e.target.value)} 
              style={inputStyle}
            />
          </div>
          <button type="submit" style={addBtnStyle}>+ Add to Library</button>
        </form>
      </div>

      {/* TABLE OF EXISTING CROPS */}
      <div style={tableContainer}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
              <th style={tdStyle}>Crop</th>
              <th style={tdStyle}>Sowing (Days)</th>
              <th style={tdStyle}>Seedling (Days)</th>
              <th style={tdStyle}>Veg (Days)</th>
            </tr>
          </thead>
          <tbody>
            {crops.map(crop => (
              <tr key={crop.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}><strong>{crop.name}</strong></td>
                <td style={tdStyle}>
                  <input type="number" step="0.01" defaultValue={crop.sowing_days} onBlur={e => handleUpdate(crop.id, 'sowing_days', e.target.value)} style={smallInput} />
                </td>
                <td style={tdStyle}>
                  <input type="number" defaultValue={crop.seedling_days} onBlur={e => handleUpdate(crop.id, 'seedling_days', e.target.value)} style={smallInput} />
                </td>
                <td style={tdStyle}>
                  <input type="number" defaultValue={crop.vegetative_days} onBlur={e => handleUpdate(crop.id, 'vegetative_days', e.target.value)} style={smallInput} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const addBoxStyle = { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #eee' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' };
const addBtnStyle = { padding: '10px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const tableContainer = { background: 'white', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' };
const tdStyle = { padding: '15px' };
const smallInput = { width: '60px', padding: '5px' };

export default CropSettings;