// src/components/TanyaAI.jsx
import React, { useState } from 'react';

function TanyaAI() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="chat-container">
      {/* The Floating Button */}
      <button className="chat-fab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬 Tanya AI'}
      </button>

      {/* The Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h4>KebunData AI Assistant</h4>
            <span>Online</span>
          </div>
          <div className="chat-body">
            <p className="ai-message">Halo Farmer Budi! Ada yang bisa saya bantu terkait data lahan Anda hari ini?</p>
          </div>
          <div className="chat-footer">
            <input type="text" placeholder="Tanya sesuatu..." />
            <button className="send-btn">➤</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TanyaAI;
