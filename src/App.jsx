import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, LayoutDashboard, Settings, Leaf } from 'lucide-react';
import FarmDashboard from './pages/FarmDashboard';
import CropSettings from './pages/CropSettings';
import './index.css';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Helper to highlight active links
  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-container">
      
      {/* --- 1. FIXED SIDEBAR --- */}
      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="brand-link">
            <Leaf size={28} className="gold-text" style={{ flexShrink: 0 }} />
            <span className="brand-text" style={{ marginLeft: '12px', fontWeight: 'bold', fontSize: '1.3rem' }}>
              Kebun<span className="gold-text">Data</span>
            </span>
          </div>

          <div className="sidebar-nav">
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              <LayoutDashboard size={22} style={{ flexShrink: 0 }} />
              <span className="nav-label">Dashboard</span>
            </Link>
            
            <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
              <Settings size={22} style={{ flexShrink: 0 }} />
              <span className="nav-label">Crop Settings</span>
            </Link>
          </div>
        </div>

        <div className="sidebar-bottom" style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {!isCollapsed && (
            <div className="sidebar-version">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', background: '#5c8a6d', borderRadius: '50%' }}></div>
                <span className="online-status">CM4 SYSTEM ONLINE</span>
              </div>
              <p style={{ marginTop: '5px', fontSize: '10px' }}>v1.0.4</p>
            </div>
          )}
        </div>
      </nav>

      {/* --- 2. MAIN WORKSPACE --- */}
      <main className="main-content" style={{ marginLeft: isCollapsed ? '80px' : '260px' }}>
        
        {/* FIXED HEADER */}
        <header className="top-bar">
          <button onClick={toggleSidebar} className="menu-btn">
            <Menu size={24} />
          </button>
          <h2 style={{ marginLeft: '20px', fontSize: '1.1rem', color: 'var(--primary-green)', fontWeight: '600' }}>
            {location.pathname === '/' ? 'Field Overview' : 'System Settings'}
          </h2>
        </header>

        {/* SCROLLABLE AREA: This is what makes the page move up and down */}
        <div className="scrollable-content">
          <Routes>
            <Route path="/" element={<FarmDashboard />} />
            <Route path="/settings" element={<CropSettings />} />
          </Routes>
          
          {/* Footer spacer to ensure content doesn't hit the bottom edge */}
          <div style={{ height: '40px' }}></div>
        </div>
      </main>
    </div>
  );
}

export default App;