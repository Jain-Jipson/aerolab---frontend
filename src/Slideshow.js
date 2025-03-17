import React, { useEffect, useState } from "react";
import "./Slideshow.css";
import { Link } from "react-router-dom";

const slides = [
  { id: 1, image: "/Images/IMAGE1.png" },
  { id: 2, image: "/Images/IMAGE2.png" },
  { id: 3, image: "/Images/IMAGE3.png" },
  { id: 4, image: "/Images/IMAGE4.png" },
  { id: 5, image: "/Images/IMAGE5.png" },
  { id: 6, image: "/Images/IMAGE6.png" },
  { id: 7, image: "/Images/IMAGE7.png" },
  { id: 8, image: "/Images/IMAGE8.png" },
  { id: 9, image: "/Images/IMAGE9.png" }
];

function Slideshow({ onClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slideshow-container" onClick={onClick}>
      {/* Slides */}
      <div className="slide-track" style={{ transform: `translateX(-${currentSlide * 33.335}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className="slide">
            <img src={slide.image} alt={`Slide ${slide.id}`} />
            <div className="slide-text">{slide.text}</div>
          </div>
        ))}
      </div>

      {/* Sidebar Toggle Button (☰) - Top Left */}
      <button className="sidebar-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/employees">Employees</Link>
        <Link to="/faq">Ask Mira</Link>
      </div>
    </div>
  );
}

export default Slideshow;