import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-slate-900 overflow-x-hidden">
      {/* Dynamic Background Ornament */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-green-50/50 to-transparent -z-10" />

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
          <span className="text-xl font-black tracking-tighter text-slate-800">Kebun<span className="text-green-600">Data</span></span>
        </div>
        <div className="hidden md:flex space-x-10 text-sm font-bold uppercase tracking-widest text-slate-500">
          <a href="#features" className="hover:text-green-600 transition">Features</a>
          <a href="#compliance" className="hover:text-green-600 transition">MyInvois</a>
          <a href="#hardware" className="hover:text-green-600 transition">Hardware</a>
        </div>
        <Link to="/login" className="bg-slate-900 text-white px-7 py-2.5 rounded-full text-sm font-bold hover:bg-green-600 transition shadow-xl shadow-green-100">
          LOGIN
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-20 pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
          <div className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-widest uppercase">
             🚀 Empowering Agroprenuer Muda 2026
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[0.95] tracking-tight">
            Grow Your Farm. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              Automate Profit.
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Industrial monitoring for **ZipGrow towers**. Integrated with **Odoo 18** for instant **LHDN MyInvois** compliance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <button onClick={() => navigate('/login')} className="bg-green-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-green-200">
              GET EARLY ACCESS
            </button>
            <button className="bg-white border-2 border-slate-100 text-slate-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all">
              WATCH DEMO
            </button>
          </div>
        </div>

        {/* Dashboard Preview UI */}
        <div className="lg:w-1/2 relative w-full group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white border border-slate-200 rounded-[2rem] p-4 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 rounded-xl p-8 aspect-video flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-400 text-xs font-mono mb-1 underline underline-offset-4">LIVE FEED: TOWER_32_S1</p>
                  <h4 className="text-white text-2xl font-bold italic">Healthy Growth</h4>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold border border-green-500/30">LHDN ENCRYPTED</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                   <p className="text-slate-400 text-[10px] uppercase mb-1">Nutrient pH</p>
                   <p className="text-2xl font-bold text-white">6.5</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                   <p className="text-slate-400 text-[10px] uppercase mb-1">EC Level</p>
                   <p className="text-2xl font-bold text-white">1.8</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                   <p className="text-slate-400 text-[10px] uppercase mb-1">Water Temp</p>
                   <p className="text-2xl font-bold text-white">28°C</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Feature Cards */}
      <section id="features" className="bg-slate-900 py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: '📊', title: 'Real-Time IoT', desc: 'Monitor towers instantly via CM4 gateway.' },
            { icon: '⚖️', title: 'LHDN Ready', desc: 'Direct e-invoicing for every harvest sale.' },
            { icon: '🏢', title: 'Odoo 18 ERP', desc: 'Manage stock & contracts in one system.' }
          ].map((item, i) => (
            <div key={i} className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-all cursor-default">
              <div className="text-5xl mb-6">{item.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;