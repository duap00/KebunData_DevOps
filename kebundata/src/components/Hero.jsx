// src/components/Hero.jsx

import React from 'react';

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h2>Growing Smarter, Not Harder.</h2>
        <p>
          KebunData is your digital dashboard for modern agriculture. 
          Harness the power of real-time data to maximize yield and 
          sustainability on your farm.
        </p>
        <button className="cta-button">
          Explore Farm Data
        </button>
      </div>
    </section>
  );
}

export default Hero;