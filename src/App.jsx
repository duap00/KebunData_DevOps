import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FarmDashboard from './pages/FarmDashboard';
import Analytics from './pages/Analytics'; 
import CropSettings from './pages/CropSettings';

function App() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false); // Reset sidebar when going to desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      
      {/* --- PREMIUM TOP BAR --- */}
      <header className="premium-top-bar">
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* MOBILE HAMBURGER: Only shows on mobile */}
          {isMobile && (
            <button 
              onClick={() => setIsOpen(!isOpen)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', marginRight: '10px', color: '#2c4035' }}
            >
              {isOpen ? '✕' : '☰'}
            </button>
          )}
          
          <img 
            src="/KebunData_logo-LG(2).png" 
            alt="KebunData Logo" 
            style={{ height: isMobile ? '30px' : '40px', width: 'auto', objectFit: 'contain' }} 
          />
          <span className="logo-text-dark" style={{ fontWeight: '800', fontSize: isMobile ? '1.1rem' : '1.4rem', letterSpacing: '0.5px' }}>
            <span style={{ color: '#2c4035' }}>Kebun</span>
            <span style={{ color: '#d4af37' }}>Data</span>
          </span>
        </div>

        {!isMobile && (
          <nav className="top-nav-links">
            <Link to="/" style={topNavLinkStyle('/')}>Home</Link>
            <Link to="/dashboard" style={topNavLinkStyle('/dashboard')}>Dashboard</Link>
            <Link to="/analytics" style={topNavLinkStyle('/analytics')}>Analytics</Link>
          </nav>
        )}

        <div className="top-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px' }}>
           <span className="status-indicator" style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>● ONLINE</span>
           <div className="profile-circle" style={{ width: '32px', height: '32px' }}>A</div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* --- SIDEBAR --- */}
        <nav className={`sidebar ${!isOpen && !isMobile ? 'collapsed' : ''}`} style={{ 
          position: isMobile ? 'fixed' : 'relative',
          height: isMobile ? '100vh' : 'auto',
          zIndex: 1001,
          transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease, width 0.3s ease',
          backgroundColor: '#2c4035',
          width: (isMobile || isOpen) ? '260px' : '70px'
        }}>
           <div className="sidebar-nav" style={{marginTop: '20px'}}>
              {/* Mobile Only Links inside Sidebar */}
              {isMobile && (
                <>
                  <Link to="/" className="sidebar-item" style={mobileSideLink} onClick={() => setIsOpen(false)}>🏠 Home</Link>
                  <Link to="/dashboard" className="sidebar-item" style={mobileSideLink} onClick={() => setIsOpen(false)}>📊 Dashboard</Link>
                  <Link to="/analytics" className="sidebar-item" style={mobileSideLink} onClick={() => setIsOpen(false)}>📈 Analytics</Link>
                  <hr style={{ opacity: 0.1, margin: '10px 20px' }} />
                </>
              )}

              <Link to="/settings" className="sidebar-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '16px 24px', 
                color: 'white', 
                textDecoration: 'none' 
              }} onClick={() => isMobile && setIsOpen(false)}>
                <span className="icon">⚙️</span>
                {(isOpen || isMobile) && <span className="label" style={{marginLeft: '12px'}}>Crop Settings</span>}
              </Link>
           </div>
           
           {!isMobile && (
             <button 
               className="collapse-toggle" 
               onClick={() => setIsOpen(!isOpen)}
               style={{ position: 'absolute', bottom: '20px', width: '100%', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
             >
               {isOpen ? '◀' : '▶'}
             </button>
           )}
        </nav>

        {/* --- MAIN CONTENT --- */}
        <main className="main-content-fluid" style={{ 
          flex: 1, 
          width: '100%',
          marginLeft: '0', 
          overflowX: 'hidden'
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<FarmDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<CropSettings />} />
          </Routes>
        </main>

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && isOpen && (
          <div 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
          />
        )}
      </div>
    </div>
  );
}

const mobileSideLink = {
  display: 'block',
  padding: '16px 24px',
  color: 'white',
  textDecoration: 'none',
  fontSize: '1rem'
};

export default App;