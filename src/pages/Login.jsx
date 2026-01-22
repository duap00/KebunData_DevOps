import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // For success messages
  const navigate = useNavigate();

  // LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  // SIGN UP HANDLER
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password to register.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Success! Please check your email for the confirmation link.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        
        {/* Branding */}
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold text-green-700 hover:opacity-80 transition">
            KebunData<span className="text-slate-400">.my</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 leading-tight">
            Farm Management <br/>& Compliance
          </h2>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm animate-pulse">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-sm">
            {message}
          </div>
        )}

        {/* Auth Form */}
        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Email</label>
              <input
                type="email"
                required
                className="block w-full px-4 py-3 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Password</label>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all shadow-lg shadow-green-200"
            >
              {loading ? 'Processing...' : 'SIGN IN'}
            </button>
            
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border-2 border-slate-100 text-sm font-bold rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-all"
            >
              CREATE NEW ACCOUNT
            </button>
          </div>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs text-slate-400">
            By accessing KebunData, you agree to our <br/>
            <span className="underline cursor-pointer hover:text-slate-600">Terms of Service</span> and <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;