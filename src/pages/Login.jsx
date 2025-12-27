import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Check your email for the confirmation link!");
    else alert("Success! Now you can login.");
    setLoading(false);
  };

  return (
    <div style={authContainer}>
      <div style={authCard}>
        <h2 style={{ color: '#27ae60', marginBottom: '10px' }}>🌱 KebunData</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Farm Management System</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={inputStyle} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={inputStyle} 
            required 
          />
          <button type="submit" disabled={loading} style={primaryBtn}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
          <button type="button" onClick={handleSignUp} style={secondaryBtn}>
            Create New Account
          </button>
        </form>
      </div>
    </div>
  );
}

// STYLES
const authContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' };
const authCard = { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '350px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' };
const primaryBtn = { padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const secondaryBtn = { background: 'none', border: 'none', color: '#27ae60', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' };

export default Login;