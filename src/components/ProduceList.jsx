import React from 'react';

const farmProduce = [
  { id: 1, name: 'Organic Corn', stock: '450 kg', status: 'In Stock' },
  { id: 2, name: 'Heirloom Tomatoes', stock: '120 kg', status: 'Harvesting' },
  { id: 3, name: 'Local Honey', stock: '15 jars', status: 'Low Stock' }
];

function ProduceList() {
  return (
    <div style={{ marginTop: '40px', background: 'white', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
      <div style={{ padding: '15px 20px', background: '#f8f9fa', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontWeight: '700', color: '#999', fontSize: '0.75rem' }}>
        <span>PRODUCT</span>
        <span>STOCK</span>
        <span>STATUS</span>
      </div>
      {farmProduce.map(item => (
        <div key={item.id} style={{ padding: '15px 20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', borderTop: '1px solid #eee', alignItems: 'center' }}>
          <span style={{ fontWeight: '600', color: 'var(--primary-green)' }}>{item.name}</span>
          <span>{item.stock}</span>
          <span style={{ color: item.status === 'Low Stock' ? 'var(--accent-gold)' : 'var(--primary-green)', fontWeight: '700' }}>
            ● {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ProduceList;