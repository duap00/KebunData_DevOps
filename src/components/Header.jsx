// src/components/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // <-- CRITICAL: Import Link for routing

function Header() {
  return (
    <header className="header-container">
      <div className="logo">
        {/* Logo/Home link must use <Link> to go to the base route */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>KebunData</h1>
        </Link>
      </div>
      <nav className="nav-menu">
        
        {/* Home link to the base route */}
        <Link to="/">Home</Link>
        
        {/* Links to sections on the Home Page use /#anchor-name */}
        <Link to="/#data">Data Dashboard</Link>
        <Link to="/#produce">Our Produce</Link>
        
        {/* Contact/About links can go to dedicated pages */}
        <Link to="/about">About Us</Link> {/* We created this page */}
        <Link to="/contact">Contact</Link> {/* We will create this page next! */}
        
      </nav>
    </header>
  );
}

export default Header;