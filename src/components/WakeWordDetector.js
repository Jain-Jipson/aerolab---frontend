import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("ws://localhost:5000/ws"); // Connect to your existing .NET backend

const WakeWordDetector = () => {
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("message", (message) => {
      console.log("Wake word detected:", message);
      navigate("/wakeword");
    });

    return () => socket.close();
  }, [navigate]);

  return <div>Listening for wake word...</div>;
};

export default WakeWordDetector;
