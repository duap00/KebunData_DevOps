import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FarmDashboard from './pages/FarmDashboard';
// Ensure these paths exist or comment them out if not used yet
import Analytics from './pages/Analytics'; 
import CropSettings from './pages/CropSettings';

function App() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Resize listener to handle mobile/desktop states correctly
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Nav Link Style for the TOP BAR
  const topNavLinkStyle = (path) => ({
    textDecoration: 'none',
    color: location.pathname === path ? '#2c4035' : '#64748b',
    fontWeight: location.pathname === path ? '700' : '500',
    padding: '8px 16px',
    borderRadius: '8px',
    background: location.pathname === path ? '#f1f5f9' : 'transparent',
    transition: '0.3s'
  });

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* --- NEW TOP MENU BAR --- */}
      <header className="premium-top-bar">
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Logo Image */}
          <img 
            src="/KebunData_logo-LG(2).png" 
            alt="KebunData Logo" 
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }} 
          />
          {/* Logo Text with Dark Forest and Gold colors */}
          <span className="logo-text-dark" style={{ fontWeight: '800', fontSize: '1.4rem', letterSpacing: '0.5px' }}>
            <span style={{ color: '#2c4035' }}>Kebun</span>
            <span style={{ color: '#d4af37' }}>Data</span>
          </span>
        </div>

        {/* Hide nav links on mobile to prevent overlap */}
        {!isMobile && (
          <nav className="top-nav-links">
            <Link to="/" style={topNavLinkStyle('/')}>Home</Link>
            <Link to="/dashboard" style={topNavLinkStyle('/dashboard')}>Dashboard</Link>
            <Link to="/analytics" style={topNavLinkStyle('/analytics')}>Analytics</Link>
          </nav>
        )}

        <div className="top-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
           <span className="status-indicator">● ONLINE</span>
           <div className="profile-circle">A</div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* --- SIDEBAR (Now specifically for Tools/Settings) --- */}
        <nav className={`sidebar ${!isOpen ? 'collapsed' : ''}`} style={{ position: 'relative' }}>
           <div className="sidebar-nav" style={{marginTop: '20px'}}>
              <Link to="/settings" className="sidebar-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '16px 24px', 
                color: 'white', 
                textDecoration: 'none' 
              }}>
                <span className="icon">⚙️</span>
                {isOpen && <span className="label" style={{marginLeft: '12px'}}>Crop Settings</span>}
              </Link>
           </div>
           
           <button 
             className="collapse-toggle" 
             onClick={() => setIsOpen(!isOpen)}
             style={{
               position: 'absolute',
               bottom: '20px',
               width: '100%',
               background: 'none',
               border: 'none',
               color: 'white',
               cursor: 'pointer'
             }}
           >
             {isOpen ? '◀' : '▶'}
           </button>
        </nav>

        {/* --- MAIN CONTENT --- */}
        <main className="main-content-fluid" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<FarmDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<CropSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;