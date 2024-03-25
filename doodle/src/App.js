/*global chrome*/
import React, { useState, useEffect } from 'react';
import logo from "./doodle-title.png";
import "./App.css";

function App() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [websiteLogo, setWebsiteLogo] = useState("");
  const [captureStarted, setCaptureStarted] = useState(false);

  const handleStartCapture = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      setCurrentUrl(tabs[0].url);
      const tabId = tabs[0].id;
      const windowId = tabs[0].windowId;
      
      // Send messages to open the side panel and start listening for tab updates
      chrome.runtime.sendMessage({ action: 'openSidePanel', tabId, windowId });
      chrome.runtime.sendMessage({ action: 'startListeningForTabUpdates' });
      //chrome.runtime.sendMessage({ action: 'startCapture' });

      window.close()
    });
  };
  

  return (
    <div className="App">
      <header className="App-header">
        {!captureStarted && (
          <div>
            <img src={logo} className="App-logo" alt="logo" />
            <p className="doodle">Doodle</p>
            <button onClick={handleStartCapture} className="start-capture-button">
              Start Capture
            </button>
          </div>
        )}
        {currentUrl && (
          <div>
            {websiteLogo ? (
              <img src={websiteLogo} alt="Website Logo" className="website-logo" />
            ) : (
              <p className="logo-placeholder">Logo not found</p>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;