import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

// 1. IMPORT YOUR PAGES
import FarmDashboard from './pages/FarmDashboard';
import CropSettings from './pages/CropSettings';
import Analytics from './pages/Analytics';

function App() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinkStyle = (path) => ({
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    color: location.pathname === path ? '#white' : 'rgba(255,255,255,0.7)',
    background: location.pathname === path ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderLeft: location.pathname === path ? '4px solid #d4af37' : '4px solid transparent',
    transition: '0.3s'
  });

  return (
    <div className="app-container">
      
      {/* SIDEBAR */}
      <nav className={`sidebar ${isMobile && !isOpen ? 'collapsed' : ''}`} 
           style={{ display: isMobile && !isOpen ? 'none' : 'flex' }}>
        <div className="brand-link">
          <span style={{ fontSize: '1.5rem' }}>🌱</span>
          <span className="brand-text" style={{ marginLeft: '10px', fontWeight: 'bold' }}>KebunData</span>
        </div>

        <div className="sidebar-nav">
          {/* 2. ADD LINKS TO THE SIDEBAR */}
          <Link to="/" style={navLinkStyle('/')} onClick={() => isMobile && setIsOpen(false)}>
            <span>📊</span> <span className="nav-label">Dashboard</span>
          </Link>
          
          <Link to="/analytics" style={navLinkStyle('/analytics')} onClick={() => isMobile && setIsOpen(false)}>
            <span>📈</span> <span className="nav-label">Analytics</span>
          </Link>
          
          <Link to="/settings" style={navLinkStyle('/settings')} onClick={() => isMobile && setIsOpen(false)}>
            <span>⚙️</span> <span className="nav-label">Crop Settings</span>
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="main-content" style={{ marginLeft: isMobile ? '0' : '260px' }}>
        <header className="top-bar">
          {isMobile && (
            <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? '✕' : '☰'}
            </button>
          )}
          <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.8rem' }}>
            System Status: <span style={{ color: '#27ae60' }}>● Online</span>
          </div>
        </header>

        <main className="scrollable-content">
          {/* 3. DEFINE THE ROUTES SO THE PAGES ACTUALLY LOAD */}
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

export default App;