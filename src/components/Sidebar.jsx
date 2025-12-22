import React, { useState } from 'react';
import { Menu, LayoutDashboard, Database, Settings, Leaf } from 'lucide-react';
/* Note: We are not relying on index.css for the width anymore */

const CollapsibleSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // This variable forces the width regardless of CSS files
  const currentWidth = isCollapsed ? '80px' : '260px';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* SIDEBAR - Width is hard-coded here to force it to work */}
      <aside 
        style={{ 
          width: currentWidth, 
          minWidth: currentWidth, 
          backgroundColor: '#2c4035', 
          transition: 'all 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
          color: 'white'
        }}
      >
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', height: '80px' }}>
          <Leaf size={30} color="#d4af37" style={{ flexShrink: 0 }} />
          {!isCollapsed && (
            <span style={{ marginLeft: '12px', fontWeight: 'bold', fontSize: '1.4rem', whiteSpace: 'nowrap' }}>
              Kebun<span style={{ color: '#d4af37' }}>Data</span>
            </span>
          )}
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <NavItem icon={<LayoutDashboard size={22} />} label="Dashboard" isCollapsed={isCollapsed} active />
          <NavItem icon={<Database size={22} />} label="Farm Logs" isCollapsed={isCollapsed} />
          <NavItem icon={<Settings size={22} />} label="Settings" isCollapsed={isCollapsed} />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f0f2f5' }}>
        <header style={{ height: '64px', background: 'white', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #ddd' }}>
          <button 
            onClick={toggleSidebar} 
            style={{ padding: '8px', cursor: 'pointer', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}
          >
            <Menu size={24} />
          </button>
          <h2 style={{ marginLeft: '20px', color: '#2c4035' }}>Field Overview</h2>
        </header>

        <main style={{ padding: '40px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
             <h2>Is the state collapsed? {isCollapsed ? "YES" : "NO"}</h2>
             <p>If this says YES but the green bar is still wide, refresh your browser or check App.jsx.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, isCollapsed, active = false }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    padding: '16px 25px', 
    cursor: 'pointer',
    backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderLeft: active ? '4px solid #d4af37' : '4px solid transparent'
  }}>
    <div style={{ flexShrink: 0 }}>{icon}</div>
    {!isCollapsed && <span style={{ marginLeft: '15px', whiteSpace: 'nowrap' }}>{label}</span>}
  </div>
);

export default CollapsibleSidebar;