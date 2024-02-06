import React, { useState } from "react";
import "./App.css";

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className={`app-container ${sidebarVisible ? "sidebar-visible" : ""}`}>
      <button onClick={toggleSidebar} className="start-button">
        Start
      </button>
      <div className="sidebar">
        {/* Add your sidebar content here */}
        Sidebar Content
      </div>
    </div>
  );
}

export default App;
