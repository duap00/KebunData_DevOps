import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="landing-page">
      {/* 1. HERO SECTION: The Vision */}
      <section className="hero-section">
        <div className="hero-text">
          <span className="badge">Smart Agriculture IoT</span>
          <h1>Transforming Agriculture with <span>Real-Time Data</span></h1>
          <p>
            Automate your farm, monitor nutrients instantly, and achieve higher yields 
            with our industrial-grade CM4 monitoring system.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn-primary">Explore Dashboard</Link>
            <a href="#about" className="btn-outline">Learn More</a>
          </div>
        </div>
        <div className="hero-image">
          {/* Replace this URL with a photo of your actual ZipGrow/Aeroponic setup */}
          <img 
            src="https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=1000" 
            alt="Smart Greenhouse" 
          />
        </div>
      </section>

      {/* 2. PRODUCT SECTION: The Quality */}
      <section id="about" className="product-section">
        <div className="product-image">
          {/* Replace with a photo of your healthy plants/Kale */}
          <img 
            src="https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?auto=format&fit=crop&q=80&w=1000" 
            alt="Healthy Plant Growth" 
          />
        </div>
        <div className="product-text">
          <h2>The Future of Farming is Here</h2>
          <p>
            Traditional farming faces challenges in nutrient consistency and water waste. 
            <strong> KebunData</strong> provides a reliable system to eliminate the guesswork, 
            ensuring your crops get exactly what they need, when they need it.
          </p>
          <ul className="benefit-list">
            <li>✅ Precise water & nutrient control</li>
            <li>✅ Reduced labor and resource waste</li>
            <li>✅ Increased yield and crop quality</li>
          </ul>
        </div>
      </section>

      {/* 3. HOW IT WORKS: The Service */}
      <section className="how-it-works">
        <h3>How it Works</h3>
        <div className="service-grid">
          <div className="service-card">
            <span className="icon">📊</span>
            <h4>Smart Dashboard</h4>
            <p>Monitor pH, EC, and Temperature from any mobile device or PC.</p>
          </div>
          <div className="service-card">
            <span className="icon">📈</span>
            <h4>Analytics</h4>
            <p>Track growth cycles and historical trends to optimize your harvest.</p>
          </div>
          <div className="service-card">
            <span className="icon">⚙️</span>
            <h4>Remote Control</h4>
            <p>Manage pump schedules and staging pipelines automatically.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2024 KebunData. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;