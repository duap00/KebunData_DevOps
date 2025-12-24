import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import FarmDashboard from './pages/FarmDashboard';
import CropSettings from './pages/CropSettings';
import Analytics from './pages/Analytics';

function App() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinkStyle = (path) => ({
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    color: location.pathname === path ? 'white' : 'rgba(255, 255, 255, 0.6)',
    background: location.pathname === path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderLeft: location.pathname === path ? '4px solid #d4af37' : '4px solid transparent',
  });

  return (
    <div className="app-container">
      
      {/* SIDEBAR */}
      <nav className={`sidebar ${(!isMobile && !isOpen) ? 'collapsed' : ''} ${(isMobile && isOpen) ? 'mobile-open' : ''}`}>
        <div className="brand-link" style={{ 
            display: 'flex', 
            justifyContent: (!isMobile && !isOpen) ? 'center' : 'flex-start',
            padding: (!isMobile && !isOpen) ? '24px 0' : '24px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🌱</span>
          <span className="brand-text" style={{ 
            marginLeft: '12px', 
            fontWeight: 'bold',
            display: (!isMobile && !isOpen) ? 'none' : 'inline' 
          }}>KebunData</span>
        </div>

        <div className="sidebar-nav">
          <Link to="/" style={navLinkStyle('/')} onClick={() => isMobile && setIsOpen(false)}>
            <span style={{width: '24px', textAlign: 'center'}}>📊</span> 
            <span className="nav-label" style={{display: (!isMobile && !isOpen) ? 'none' : 'inline', marginLeft: '10px'}}>Dashboard</span>
          </Link>
          <Link to="/analytics" style={navLinkStyle('/analytics')} onClick={() => isMobile && setIsOpen(false)}>
            <span style={{width: '24px', textAlign: 'center'}}>📈</span> 
            <span className="nav-label" style={{display: (!isMobile && !isOpen) ? 'none' : 'inline', marginLeft: '10px'}}>Analytics</span>
          </Link>
          <Link to="/settings" style={navLinkStyle('/settings')} onClick={() => isMobile && setIsOpen(false)}>
            <span style={{width: '24px', textAlign: 'center'}}>⚙️</span> 
            <span className="nav-label" style={{display: (!isMobile && !isOpen) ? 'none' : 'inline', marginLeft: '10px'}}>Settings</span>
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="main-content" style={{ 
        marginLeft: (isMobile || !isOpen) ? (isMobile ? '0' : '80px') : '260px',
        transition: 'margin-left 0.3s ease'
      }}>
        <header className="top-bar">
          <button className="menu-btn" onClick={() => setIsOpen(!isOpen)} style={hamburgerContainer}>
            <div style={barStyle(isOpen)}></div>
            <div style={barStyle(isOpen, true)}></div>
            <div style={barStyle(isOpen)}></div>
          </button>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>CM4 Status:</span>
            <span style={{ color: '#27ae60', fontWeight: 'bold' }}>● ONLINE</span>
          </div>
        </header>

        <main className="scrollable-content">
          <Routes>
            <Route path="/" element={<FarmDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<CropSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// --- 🍔 HAMBURGER STYLES ---
const hamburgerContainer = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  width: '24px',
  height: '18px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0',
  outline: 'none'
};

const barStyle = (isOpen, isMiddle) => ({
  width: '24px',
  height: '3px',
  background: '#2c4035',
  borderRadius: '10px',
  transition: 'all 0.3s ease',
  transformOrigin: 'left center'
});

export default App;