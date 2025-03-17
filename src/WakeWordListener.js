import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const WakeWordListener = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("navigate", (page) => {
      console.log("Navigating to:", page);
      navigate(page);
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default WakeWordListener;
