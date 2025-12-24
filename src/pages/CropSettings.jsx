import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function CropSettings() {
  const [crops, setCrops] = useState([]);
  const [newCropName, setNewCropName] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    fetchCrops();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCrops = async () => {
    const { data } = await supabase.from('crops').select('*').order('name');
    if (data) setCrops(data);
  };

  const addCrop = async (e) => {
    e.preventDefault();
    if (!newCropName) return;

    const { error } = await supabase.from('crops').insert([{ 
      name: newCropName,
      sowing_days: 0.02,
      seedling_days: 3,
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
    }
  };

  const handleUpdate = async (id, field, value) => {
    await supabase.from('crops').update({ [field]: parseFloat(value) }).eq('id', id);
    fetchCrops();
  };

  const deleteCrop = async (id, name) => {
    if (window.confirm(`Delete ${name} from library?`)) {
      await supabase.from('crops').delete().eq('id', id);
      fetchCrops();
    }
  };

  return (
    <div style={{ padding: isMobile ? '10px' : '20px' }}>
      <h2 style={{ color: '#27ae60', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>🌱 Crop Library</h2>

      {/* RESPONSIVE ADD FORM */}
      <div style={addBoxStyle}>
        <form onSubmit={addCrop} style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: '10px', 
          alignItems: isMobile ? 'stretch' : 'flex-end' 
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>New Crop Name</label>
            <input 
              type="text" 
              placeholder="e.g. Mint" 
              value={newCropName} 
              onChange={e => setNewCropName(e.target.value)} 
              style={inputStyle}
            />
          </div>
          <button type="submit" style={addBtnStyle}>+ Add Crop</button>
        </form>
      </div>

      {/* RESPONSIVE SCROLLABLE TABLE */}
      <div style={{ 
        width: '100%', 
        overflowX: 'auto', 
        WebkitOverflowScrolling: 'touch', 
        background: 'white', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #eee'
      }}>
        <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Crop Name</th>
              <th style={thStyle}>Sowing (Days)</th>
              <th style={thStyle}>Seedling</th>
              <th style={thStyle}>Germination</th>
              <th style={thStyle}>Vegetative</th>
              <th style={thStyle}>Harvest</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {crops.map(crop => (
              <tr key={crop.id} style={rowStyle}>
                <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2c3e50' }}>{crop.name}</td>
                <td style={tdStyle}>
                  <input type="number" step="0.01" defaultValue={crop.sowing_days} onBlur={e => handleUpdate(crop.id, 'sowing_days', e.target.value)} style={tableInput} />
                </td>
                <td style={tdStyle}>
                  <input type="number" defaultValue={crop.seedling_days} onBlur={e => handleUpdate(crop.id, 'seedling_days', e.target.value)} style={tableInput} />
                </td>
                <td style={tdStyle}>
                  <input type="number" defaultValue={crop.germination_days} onBlur={e => handleUpdate(crop.id, 'germination_days', e.target.value)} style={tableInput} />
                </td>
                <td style={tdStyle}>
                  <input type="number" defaultValue={crop.vegetative_days} onBlur={e => handleUpdate(crop.id, 'vegetative_days', e.target.value)} style={tableInput} />
                </td>
                <td style={tdStyle}>
                  <input type="number" defaultValue={crop.harvest_days} onBlur={e => handleUpdate(crop.id, 'harvest_days', e.target.value)} style={tableInput} />
                </td>
                <td style={tdStyle}>
                  <button onClick={() => deleteCrop(crop.id, crop.name)} style={delBtn}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// STYLES
const addBoxStyle = { background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #eee' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px', fontSize: '16px' }; // 16px prevents iOS zoom
const addBtnStyle = { padding: '12px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' };
const tdStyle = { padding: '12px 15px', borderBottom: '1px solid #f0f0f0' };
const rowStyle = { transition: 'background 0.2s' };
const tableInput = { width: '60px', padding: '8px', border: '1px solid #eee', borderRadius: '4px', textAlign: 'center' };
const delBtn = { background: '#fff0f0', color: '#e74c3c', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' };

export default CropSettings;