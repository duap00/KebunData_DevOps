import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function CropSettings() {
  const [crops, setCrops] = useState([]);
  const [newCropName, setNewCropName] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    fetchCrops();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCrops = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('crops').select('*').order('name');
    if (error) console.error("Error fetching crops:", error);
    if (data) setCrops(data);
    setLoading(false);
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
      alert("Error adding crop: " + error.message);
    } else {
      setNewCropName('');
      fetchCrops();
    }
  };

  const handleUpdate = async (id, field, value) => {
    const { error } = await supabase.from('crops').update({ [field]: parseFloat(value) }).eq('id', id);
    if (error) console.error("Update failed:", error);
    // Optional: fetchCrops() to sync, but usually not needed for onBlur
  };

  const deleteCrop = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently remove ${name}?`)) {
      const { error } = await supabase.from('crops').delete().eq('id', id);
      if (error) {
        alert("Delete failed: " + error.message);
      } else {
        // Optimistic UI update for immediate feedback
        setCrops(crops.filter(c => c.id !== id));
      }
    }
  };

  return (
    <div style={{ padding: isMobile ? '10px' : '30px', maxWidth: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#27ae60', margin: 0 }}>🌱 Crop Library</h2>
        {loading && <span style={{ fontSize: '0.8rem', color: '#888' }}>Updating...</span>}
      </div>

      {/* ADD CROP FORM */}
      <div style={addBoxStyle}>
        <form onSubmit={addCrop} style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: '12px' 
        }}>
          <input 
            type="text" 
            placeholder="New Crop Name..." 
            value={newCropName} 
            onChange={e => setNewCropName(e.target.value)} 
            style={inputStyle}
          />
          <button type="submit" style={addBtnStyle}>+ Add Crop</button>
        </form>
      </div>

      {/* SCROLLABLE TABLE CONTAINER */}
      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Crop Name</th>
              <th style={thStyle}>Sowing</th>
              <th style={thStyle}>Seedling</th>
              <th style={thStyle}>Germination</th>
              <th style={thStyle}>Vegetative</th>
              <th style={thStyle}>Harvest</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '120px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {crops.length > 0 ? crops.map(crop => (
              <tr key={crop.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2c3e50' }}>{crop.name}</td>
                <td style={tdStyle}><input type="number" step="0.01" defaultValue={crop.sowing_days} onBlur={e => handleUpdate(crop.id, 'sowing_days', e.target.value)} style={tableInput} /></td>
                <td style={tdStyle}><input type="number" defaultValue={crop.seedling_days} onBlur={e => handleUpdate(crop.id, 'seedling_days', e.target.value)} style={tableInput} /></td>
                <td style={tdStyle}><input type="number" defaultValue={crop.germination_days} onBlur={e => handleUpdate(crop.id, 'germination_days', e.target.value)} style={tableInput} /></td>
                <td style={tdStyle}><input type="number" defaultValue={crop.vegetative_days} onBlur={e => handleUpdate(crop.id, 'vegetative_days', e.target.value)} style={tableInput} /></td>
                <td style={tdStyle}><input type="number" defaultValue={crop.harvest_days} onBlur={e => handleUpdate(crop.id, 'harvest_days', e.target.value)} style={tableInput} /></td>
                
                {/* HIGH VISIBILITY REMOVE BUTTON */}
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button 
                    onClick={() => deleteCrop(crop.id, crop.name)} 
                    style={removeButtonStyle}
                  >
                    REMOVE
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  No crops found. Add your first variety above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// STYLES
const addBoxStyle = { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const inputStyle = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' };
const addBtnStyle = { padding: '12px 24px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

const tableWrapper = { 
  width: '100%', 
  overflowX: 'auto', 
  background: 'white', 
  borderRadius: '12px',
  border: '1px solid #eee',
  WebkitOverflowScrolling: 'touch' 
};

const tableStyle = { width: '100%', minWidth: '950px', borderCollapse: 'collapse' };
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.75rem', color: '#95a5a6', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle = { padding: '15px', verticalAlign: 'middle' };
const tableInput = { width: '60px', padding: '8px', border: '1px solid #f0f0f0', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem' };

// CRITICAL FIX: The button style that won't disappear
const removeButtonStyle = {
  background: '#ff4d4f',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  display: 'inline-block',
  minWidth: '90px',
  textAlign: 'center',
  transition: 'background 0.2s',
  boxShadow: '0 2px 0 rgba(0,0,0,0.045)'
};

export default CropSettings;