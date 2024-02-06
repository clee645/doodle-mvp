/*global chrome*/
import React from 'react';
import logo from './doodle-title.png';
import './App.css';

function App() {
  const handleStartCapture = () => {
    // Add your logic for starting the capture
    alert('Capture started!');
    chrome.tabs.captureVisibleTab({ format: "png" }, function (screenshotUrl) {
      const link = document.createElement("a");
      link.href = screenshotUrl;
      link.download = "screenshot.png";
      link.click();
    });
  };


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* <h1 className="App-title">Doodle</h1> */}
        <button onClick={handleStartCapture} className="start-capture-button">
          Start Capture
        </button>
      </header>
    </div>
  );
}

export default App;
