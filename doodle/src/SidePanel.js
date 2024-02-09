import React from 'react';
import './SidePanel.css';

const SidePanel = ({ isOpen, onClose }) => {
  return (
    <div className={`side-panel ${isOpen ? 'open' : ''}`}>
      <div className="content">
        <h2>Side Panel Content</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SidePanel;
