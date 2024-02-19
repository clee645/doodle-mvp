/*global chrome*/
import React, { useState, useEffect } from 'react';
import logo from "./doodle-title.png";
import axios from 'axios';
import "./App.css";

function App() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [websiteLogo, setWebsiteLogo] = useState("");
  const [captureStarted, setCaptureStarted] = useState(false);

  useEffect(() => {
    if (currentUrl) {
      fetchWebsiteLogo();
    }
  }, [currentUrl]);

  const handleStartCapture = () => {
    // chrome.tabs.captureVisibleTab({ format: "png" }, function (screenshotUrl) {
    //   const link = document.createElement("a");
    //   link.href = screenshotUrl;
    //   link.download = "screenshot.png";
    //   link.click();
    // });


    // Use chrome.tabs instead of just tabs
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log('opened side panel')
      setCurrentUrl(tabs[0].url);
      const tabId = tabs[0].id;
      const windowId = tabs[0].windowId;
      chrome.runtime.sendMessage({ action: 'openSidePanel', tabId, windowId });
    });

    chrome.tabs.captureVisibleTab({ format: "png" }, function (screenshotUrl) {
      console.log('App.js sending message with screenshot')
      chrome.runtime.sendMessage({ action: 'displayScreenshot', screenshotUrl});
    });

    
    
    // Hide the app logo and the "Start Capture" button
    setCaptureStarted(true);
  };

  // Function to extract the domain name from the URL
  const extractDomain = (url) => {
    let domain = "";
    // Find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }
    // Find & remove www. prefix
    domain = domain.replace("www.", "");
    // Find the position of ".com" and extract the substring until that position
    const endIndex = domain.indexOf(".com") !== -1 ? domain.indexOf(".com") + 4 : domain.length;
    return domain.substring(0, endIndex);
  };

  // Function to fetch website logo
  const fetchWebsiteLogo = async () => {
    try {
      const domain = extractDomain(currentUrl);
      const response = await axios.get(`https://logo.clearbit.com/${domain}`);
      setWebsiteLogo(response.request.responseURL);
    } catch (error) {
      console.error('Error fetching logo:', error);
      setWebsiteLogo("");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {!captureStarted && (
          <div>
            <img src={logo} className="App-logo" alt="logo" />
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
            <p className="url">{extractDomain(currentUrl)}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;