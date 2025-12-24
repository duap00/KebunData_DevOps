import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import FarmDashboard from './pages/FarmDashboard';
import CropSettings from './pages/CropSettings';

function App() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Update layout when window is resized
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLinkStyle = (path) => ({
    textDecoration: 'none',
    color: location.pathname === path ? '#27ae60' : '#444',
    background: location.pathname === path ? '#f0fdf4' : 'transparent',
    padding: isMobile ? '8px 12px' : '12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: isMobile ? '0.8rem' : '0.9rem',
    borderLeft: !isMobile && location.pathname === path ? '4px solid #27ae60' : 'none',
    borderBottom: isMobile && location.pathname === path ? '3px solid #27ae60' : 'none',
    whiteSpace: 'nowrap'
  });

  // Responsive Styles
  const sidebarContainerStyle = {
    width: isMobile ? '100%' : '240px',
    height: isMobile ? 'auto' : '100vh',
    position: isMobile ? 'sticky' : 'fixed',
    top: 0,
    left: 0,
    background: 'white',
    borderRight: isMobile ? 'none' : '1px solid #eee',
    borderBottom: isMobile ? '1px solid #eee' : 'none',
    padding: isMobile ? '10px 15px' : '20px',
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    alignItems: isMobile ? 'center' : 'flex-start',
    justifyContent: isMobile ? 'space-between' : 'flex-start',
    zIndex: 1000,
  };

  const navLinksGroup = {
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    gap: '10px',
    marginTop: isMobile ? '0' : '30px',
    overflowX: isMobile ? 'auto' : 'visible',
    width: isMobile ? 'auto' : '100%'
  };

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', background: '#f8f9fa' }}>
      
      {/* RESPONSIVE NAVIGATION */}
      <nav style={sidebarContainerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>🌱</span>
          <h1 style={{ color: '#27ae60', fontSize: isMobile ? '1rem' : '1.2rem', margin: 0 }}>KebunData</h1>
        </div>
        
        <div style={navLinksGroup}>
          <Link to="/" style={getLinkStyle('/')}>📊 Dashboard</Link>
          <Link to="/settings" style={getLinkStyle('/settings')}>⚙️ Settings</Link>
        </div>
        
        {!isMobile && (
          <div style={{ marginTop: 'auto', fontSize: '0.7rem', color: '#999' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', background: '#27ae60', borderRadius: '50%' }}></div>
              CM4 System Online
            </div>
          </div>
        )}
      </nav>

      {/* CONTENT AREA */}
      <main style={{ 
        flex: 1, 
        marginLeft: isMobile ? '0' : '240px', 
        padding: isMobile ? '15px' : '30px',
        marginTop: isMobile ? '10px' : '0'
      }}>
        <Routes>
          <Route path="/" element={<FarmDashboard />} />
          <Route path="/settings" element={<CropSettings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;