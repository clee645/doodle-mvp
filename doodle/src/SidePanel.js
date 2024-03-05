import React from 'react';
import './SidePanel.css';

// Listen for messages from the main app
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Check if the message contains website and logo information
  if (message.action === 'updateWebsiteInfo') {
    // Display the website logo
    if (message.logoUrl) {
      const logoImage = document.createElement('img');
      logoImage.src = message.logoUrl;
      logoImage.alt = 'Website Logo';
      logoImage.className = 'website-logo';
      document.getElementById('logoContainer').appendChild(logoImage);
    }

    // Display the website information
    const websiteInfo = document.getElementById('websiteInfo');
    websiteInfo.textContent = message.websiteInfo;
  }
});

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
