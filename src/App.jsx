import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Ensure this path is correct
import HomePage from './pages/HomePage';
import FarmDashboard from './pages/FarmDashboard';
import Analytics from './pages/Analytics'; 
import CropSettings from './pages/CropSettings';
import Login from './pages/Login'; // Import your new Login page

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // --- AUTHENTICATION LOGIC ---
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate('/'); // Redirect to home/login on sign out
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false); 
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- IF NOT LOGGED IN, ONLY SHOW LOGIN ---
  if (!session) {
    return <Login />;
  }

  // Helper to determine active link styling
  const isActive = (path) => location.pathname === path;

  const topNavLinkStyle = (path) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#2c4035' : '#64748b',
    fontWeight: isActive(path) ? '700' : '500',
    padding: '8px 16px',
    borderRadius: '8px',
    background: isActive(path) ? '#f1f5f9' : 'transparent',
    transition: '0.3s'
  });

  const sidebarLinkStyle = (path) => ({
    display: 'flex', 
    alignItems: 'center', 
    padding: '16px 24px', 
    color: 'white', 
    textDecoration: 'none',
    background: isActive(path) ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderLeft: isActive(path) ? '4px solid #d4af37' : '4px solid transparent'
  });

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* --- PREMIUM TOP BAR --- */}
      <header className="premium-top-bar" style={{ zIndex: 1100, position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', height: '70px', background: 'white', borderBottom: '1px solid #eee' }}>
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
           <span className="status-indicator" style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#27ae60', fontWeight: 'bold' }}>● ONLINE</span>
           
           {/* SIGN OUT BUTTON */}
           <button 
             onClick={() => supabase.auth.signOut()}
             style={{
               background: '#fee2e2',
               color: '#dc2626',
               border: 'none',
               padding: '6px 12px',
               borderRadius: '6px',
               fontSize: '0.75rem',
               fontWeight: 'bold',
               cursor: 'pointer'
             }}
           >
             LOGOUT
           </button>

           <div className="profile-circle" style={{ 
             width: '32px', 
             height: '32px', 
             borderRadius: '50%', 
             background: '#2c4035', 
             color: 'white', 
             display: 'flex', 
             justifyContent: 'center', 
             alignItems: 'center',
             fontSize: '0.8rem'
           }}>
             {session?.user?.email?.charAt(0).toUpperCase()}
           </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* --- SIDEBAR --- */}
        <nav className={`sidebar ${!isOpen && !isMobile ? 'collapsed' : ''}`} style={{ 
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          height: '100%',
          zIndex: 1050,
          transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease, width 0.3s ease',
          backgroundColor: '#2c4035',
          width: (isMobile || isOpen) ? '260px' : '70px',
          boxShadow: isMobile && isOpen ? '10px 0 15px rgba(0,0,0,0.1)' : 'none'
        }}>
           <div className="sidebar-nav" style={{marginTop: '20px'}}>
              {isMobile && (
                <>
                  <Link to="/" className="sidebar-item" style={mobileSideLink} onClick={() => setIsOpen(false)}>🏠 Home</Link>
                  <Link to="/dashboard" className="sidebar-item" style={mobileSideLink} onClick={() => setIsOpen(false)}>📊 Dashboard</Link>
                  <Link to="/analytics" className="sidebar-item" style={mobileSideLink} onClick={() => setIsOpen(false)}>📈 Analytics</Link>
                  <hr style={{ opacity: 0.1, margin: '10px 20px' }} />
                </>
              )}

              <Link to="/settings" className="sidebar-item" style={sidebarLinkStyle('/settings')} onClick={() => isMobile && setIsOpen(false)}>
                <span className="icon">⚙️</span>
                {(isOpen || isMobile) && <span className="label" style={{marginLeft: '12px'}}>Crop Settings</span>}
              </Link>
           </div>
           
           {!isMobile && (
             <button 
               className="collapse-toggle" 
               onClick={() => setIsOpen(!isOpen)}
               style={{ position: 'absolute', bottom: '20px', width: '100%', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
             >
               {isOpen ? '◀' : '▶'}
             </button>
           )}
        </nav>

        {/* --- MAIN CONTENT --- */}
        <main className="main-content-fluid" style={{ 
          flex: 1, 
          width: '100%',
          overflowX: 'hidden',
          overflowY: 'auto', 
          backgroundColor: '#f8fafc',
          paddingBottom: '40px'
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1040, backdropFilter: 'blur(2px)' }}
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
  fontSize: '1rem',
  transition: '0.2s'
};

export default App;