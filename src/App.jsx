import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import FarmDashboard from './pages/FarmDashboard';
import CropSettings from './pages/CropSettings';
import Analytics from './pages/Analytics';

function App() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);

  // Handle screen resizing for responsive logic
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Automatically close sidebar when switching to mobile view
      if (mobile) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Styles for Navigation Links
  const navLinkStyle = (path) => ({
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    color: location.pathname === path ? 'white' : 'rgba(255, 255, 255, 0.6)',
    background: location.pathname === path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderLeft: location.pathname === path ? '4px solid #d4af37' : '4px solid transparent',
    transition: '0.3s'
  });

  // Sidebar CSS logic based on state
  const sidebarClass = `sidebar ${(!isMobile && !isOpen) ? 'collapsed' : ''} ${(isMobile && isOpen) ? 'mobile-open' : ''}`;

  return (
    <div className="app-container">
      
      {/* SIDEBAR NAVIGATION */}
      <nav className={sidebarClass}>
        <div className="brand-link" style={{ 
            display: 'flex', 
            justifyContent: (!isMobile && !isOpen) ? 'center' : 'flex-start',
            padding: (!isMobile && !isOpen) ? '24px 0' : '24px',
            overflow: 'hidden'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🌱</span>
          <span className="brand-text" style={{ 
            marginLeft: '12px', 
            fontWeight: 'bold',
            display: (!isMobile && !isOpen) ? 'none' : 'inline',
            whiteSpace: 'nowrap'
          }}>KebunData</span>
        </div>

        <div className="sidebar-nav">
          <Link to="/" style={navLinkStyle('/')} onClick={() => isMobile && setIsOpen(false)}>
            <span style={{width: '24px', textAlign: 'center', fontSize: '1.2rem'}}>📊</span> 
            <span className="nav-label" style={{display: (!isMobile && !isOpen) ? 'none' : 'inline', marginLeft: '12px'}}>Dashboard</span>
          </Link>

          <Link to="/analytics" style={navLinkStyle('/analytics')} onClick={() => isMobile && setIsOpen(false)}>
            <span style={{width: '24px', textAlign: 'center', fontSize: '1.2rem'}}>📈</span> 
            <span className="nav-label" style={{display: (!isMobile && !isOpen) ? 'none' : 'inline', marginLeft: '12px'}}>Analytics</span>
          </Link>

          <Link to="/settings" style={navLinkStyle('/settings')} onClick={() => isMobile && setIsOpen(false)}>
            <span style={{width: '24px', textAlign: 'center', fontSize: '1.2rem'}}>⚙️</span> 
            <span className="nav-label" style={{display: (!isMobile && !isOpen) ? 'none' : 'inline', marginLeft: '12px'}}>Settings</span>
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="main-content" style={{ 
        marginLeft: (isMobile) ? '0' : (isOpen ? '260px' : '80px'),
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%'
      }}>
        
        {/* TOP HEADER BAR */}
        <header className="top-bar">
          <button className="menu-btn" onClick={() => setIsOpen(!isOpen)} style={hamburgerContainer}>
            <div style={barStyle(isOpen, 'top')}></div>
            <div style={barStyle(isOpen, 'middle')}></div>
            <div style={barStyle(isOpen, 'bottom')}></div>
          </button>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                System:
            </span>
            <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '0.85rem' }}>
                ● ONLINE
            </span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="scrollable-content">
          <Routes>
            <Route path="/" element={<FarmDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<CropSettings />} />
          </Routes>
        </main>
      </div>

      {/* MOBILE OVERLAY (Closes menu when clicking outside) */}
      {isMobile && isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 998
          }}
        />
      )}
    </div>
  );
}

// --- 🍔 STYLES ---

const hamburgerContainer = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '24px',
  height: '18px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0',
  outline: 'none',
  zIndex: '1001'
};

const barStyle = (isOpen, pos) => {
  let styles = {
    width: '24px',
    height: '3px',
    background: '#2c4035',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
    transformOrigin: 'left center'
  };

  if (isOpen) {
    styles.background = '#d4af37'; // Change to Gold color when open
    if (pos === 'top') styles.transform = 'rotate(45deg)';
    if (pos === 'middle') styles.opacity = '0';
    if (pos === 'bottom') styles.transform = 'rotate(-45deg)';
  }

  return styles;
};

export default App;