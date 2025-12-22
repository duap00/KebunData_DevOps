// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="footer-container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
        
        {/* Column 1: Brand & Mission */}
        <div className="footer-col" style={{ flex: '1', minWidth: '250px' }}>
          <h3 style={{ color: '#FFC300', marginBottom: '15px' }}>KebunData</h3>
          <p style={{ fontSize: '0.9rem', opacity: '0.8', lineHeight: '1.8' }}>
            Memberdayakan petani modern dengan integrasi teknologi IoT dan analisis data 
            untuk masa depan pertanian yang berkelanjutan dan cerdas.
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="footer-col" style={{ flex: '1', minWidth: '150px' }}>
          <h4 style={{ color: '#FFC300', marginBottom: '15px' }}>Navigasi</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Beranda</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="#data" style={{ color: '#fff', textDecoration: 'none' }}>Panel IoT</a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/about" style={{ color: '#fff', textDecoration: 'none' }}>Tentang Kami</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className="footer-col" style={{ flex: '1', minWidth: '200px' }}>
          <h4 style={{ color: '#FFC300', marginBottom: '15px' }}>Kontak</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>📍 Seremban, Negeri Sembilan</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>📧 support@kebundata.com</p>
          <p style={{ fontSize: '0.9rem' }}>📞 +60 12-345 6789</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} KebunData | Golden Harvest. Built for Farmers.</p>
      </div>
    </footer>
  );
}

export default Footer;