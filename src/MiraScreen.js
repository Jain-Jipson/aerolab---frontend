import React, { useEffect, useState } from "react";
import "./MiraScreen.css";
import { Link } from "react-router-dom";

function MiraScreen({ resetToSlides }) {
  const [inactiveTime, setInactiveTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setInactiveTime((prev) => prev + 1);
      if (inactiveTime >= 30) resetToSlides();
    }, 1000);

    return () => clearInterval(interval);
  }, [inactiveTime, resetToSlides]);

  return (
    <div className="mira-screen">
      <img src="/images/mira.png" alt="Mira AI" className="mira-image" />
      <p className="mira-text">Hello! How can I assist you today?</p>

      {/* ✅ Draggable Sidebar for Navigation */}
      <div className="sidebar">
        <Link to="/employees">Employees</Link>
        <Link to="/admin-login">Admin Login</Link>
        <Link to="/faq">Ask Mira</Link>
      </div>
    </div>
  );
}

export default MiraScreen;
