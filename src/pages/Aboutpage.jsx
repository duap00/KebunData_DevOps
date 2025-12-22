// src/pages/AboutPage.jsx

import React from 'react';

function AboutPage() {
  return (
    <div className="page-content">
      <h2 className="section-title" style={{ paddingTop: '50px' }}>About KebunData</h2>
      <p style={{ maxWidth: '800px', margin: '20px auto 40px', fontSize: '1.1em', lineHeight: '1.6' }}>
        KebunData was founded on the principle that data and nature can coexist 
        harmoniously. Our mission is to provide local farmers with the cutting-edge 
        insights needed to maximize yield, minimize waste, and practice truly 
        sustainable agriculture. We combine decades of farming experience with the 
        latest in IoT (Internet of Things) and predictive analytics.
      </p>
      
      <div style={{ height: '400px', backgroundColor: '#e9f5e9', textAlign: 'center', lineHeight: '400px', color: '#38761d' }}>
        [Placeholder for Team Photo or Farm History Timeline]
      </div>

      <div style={{ paddingBottom: '50px' }}></div>
    </div>
  );
}

export default AboutPage;