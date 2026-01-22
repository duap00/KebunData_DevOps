import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; 
import HomePage from './pages/HomePage'; // You can keep this as a backup
import FarmDashboard from './pages/FarmDashboard';
import Analytics from './pages/Analytics'; 
import CropSettings from './pages/CropSettings';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage'; // The new high-conversion page

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Check if we are on the Public Landing Page
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setSession(null);
        navigate('/'); 
      }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const sidebarLinkStyle = (path) => ({
    display: 'flex', 
    justifyContent: isMobile ? 'flex-start' : 'center', 
    alignItems: 'center', 
    padding: '20px 0', 
    color: 'white', 
    textDecoration: 'none',
    background: isActive(path) ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderLeft: isActive(path) ? '4px solid #d4af37' : '4px solid transparent',
    fontSize: '1.2rem'
  });

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. ONLY SHOW DASHBOARD HEADER IF NOT ON LANDING PAGE */}
      {!isLandingPage && (
        <header style={{ zIndex: 1100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', height: '70px', background: 'white', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#2c4035' }}>
                {isOpen ? '✕' : '☰'}
              </button>
            )}
            <img src="/KebunData_logo-LG(2).png" alt="Logo" style={{ height: '35px' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#2c4035' }}>Kebun<span style={{color:'#d4af37'}}>Data</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             {session ? (
               <button onClick={handleLogout} style={logoutBtnStyle}>LOGOUT</button>
             ) : (
               <Link to="/login" style={loginBtnStyle}>LOGIN</Link>
             )}
             {session && <div style={profileCircleStyle}>{session.user.email.charAt(0).toUpperCase()}</div>}
          </div>
        </header>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* 2. ONLY SHOW SIDEBAR IF NOT ON LANDING PAGE */}
        {!isLandingPage && (
          <nav style={{ 
            position: isMobile ? 'fixed' : 'relative',
            top: 0, left: 0, height: '100%', zIndex: 1050,
            transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
            transition: 'transform 0.3s ease',
            backgroundColor: '#2c4035',
            width: isMobile ? '260px' : '70px',
          }}>
             <div style={{ marginTop: '20px' }}>
                <Link to="/" style={sidebarLinkStyle('/')} title="Home" onClick={() => isMobile && setIsOpen(false)}>
                  🏠 {isMobile && <span style={{marginLeft: '15px'}}>Home</span>}
                </Link>
                <Link to="/dashboard" style={sidebarLinkStyle('/dashboard')} title="Dashboard" onClick={() => isMobile && setIsOpen(false)}>
                  📊 {isMobile && <span style={{marginLeft: '15px'}}>Dashboard</span>}
                </Link>
                <Link to="/analytics" style={sidebarLinkStyle('/analytics')} title="Analytics" onClick={() => isMobile && setIsOpen(false)}>
                  📈 {isMobile && <span style={{marginLeft: '15px'}}>Analytics</span>}
                </Link>
                <Link to="/settings" style={sidebarLinkStyle('/settings')} title="Settings" onClick={() => isMobile && setIsOpen(false)}>
                  ⚙️ {isMobile && <span style={{marginLeft: '15px'}}>Settings</span>}
                </Link>
             </div>
          </nav>
        )}

        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: isLandingPage ? 'white' : '#f8fafc' }}>
          <Routes>
            {/* 3. SET LANDINGPAGE AS THE DEFAULT ROOT */}
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={session ? <FarmDashboard /> : <Navigate to="/login" />} />
            <Route path="/analytics" element={session ? <Analytics /> : <Navigate to="/login" />} />
            <Route path="/settings" element={session ? <CropSettings /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        {isMobile && isOpen && !isLandingPage && (
          <div onClick={() => setIsOpen(false)} style={overlayStyle} />
        )}
      </div>
    </div>
  );
}

// STYLES
const logoutBtnStyle = { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' };
const loginBtnStyle = { background: '#27ae60', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' };
const profileCircleStyle = { width: '30px', height: '30px', borderRadius: '50%', background: '#2c4035', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem' };
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1040 };

export default App;