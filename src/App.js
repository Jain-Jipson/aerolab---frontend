import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import WakeWordListener from "./WakeWordListener";
import Slideshow from "./Slideshow";
import MiraScreen from "./MiraScreen";
import "./FAQChatbot.css"; // Importing CSS file
import "./EmployeeList.css"; // Add this for styling

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (username === "admin" && password === "2444666668888888") {
      const token = "your-jwt-token"; // Simulate token
      localStorage.setItem("auth", "true");
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      navigate("/add-employee");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => navigate("/employees")}>Back</button>
    </div>
  );
}

function Home() {
  return (
    <div>
      <h1>Employee Management</h1>
      <Link to="/employees"><button>Employees</button></Link>
      <Link to="/faq"><button>Ask Mira</button></Link> {/* ✅ Added FAQ Chatbot Link */}
    </div>
  );
}

// ✅ OpenAI API Keys (Replace with actual API keys)
const OPENAI_API_KEY = "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";

// ✅ Function to handle speech recognition (STT - Whisper API)
const recordAudio = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("file", audioBlob, "speech.wav");
        formData.append("model", "whisper-1");

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
          body: formData,
        });

        const data = await response.json();
        resolve(data.text);
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 4000); // Record for 4 seconds
    });
  } catch (error) {
    console.error("Error recording audio:", error);
  }
};

// ✅ Function to play AI-generated text (TTS - OpenAI)
const playAudioResponse = async (text) => {
  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "alloy", // Choose from: alloy, echo, fable, onyx, nova, or shimmer
      }),
    });

    if (!response.ok) throw new Error("TTS request failed");

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error("Error playing response:", error);
  }
};

// ✅ FAQChatbot Component with Voice Support
function FAQChatbot() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]); // Stores Q&A history
  const [loading, setLoading] = useState(false);
  const [fullSpeech, setFullSpeech] = useState(true); // Toggle for full/partial speech
  const [welcomeMessage, setWelcomeMessage] = useState("WELCOME TO AEROLAB, HOW CAN I ASSIST YOU TODAY?");
  const navigate = useNavigate();

  useEffect(() => {
    const playWelcomeMessage = () => {
      console.log("Playing welcome message");
      setTimeout(() => {
        playAudioResponse(welcomeMessage);
      }, 500);
    };
  
    playWelcomeMessage(); // ✅ Always play when entering the page
  
    return () => {
      sessionStorage.removeItem("hasVisitedMira"); // ✅ Reset when leaving the page
    };
  }, []);

  useEffect(() => {
    const inactivityTimer = setTimeout(() => {
      navigate("/"); // Navigate to home page after 1 minute of inactivity
    }, 60000);

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);
  
  const askQuestion = async () => {
    if (!question.trim()) return; // Prevent empty submissions
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5054/api/faqs/search?query=${encodeURIComponent(question)}`);
      const data = await response.json();
      const fetchedAnswer = data.answer || "No answer found.";
      
      // ✅ Update history
      setHistory([...history, { question, answer: fetchedAnswer }]);
      setQuestion("");

      // ✅ Speak the answer
      playAudioResponse(fullSpeech ? fetchedAnswer : fetchedAnswer.split(" ").slice(0, 10).join(" ") + "...");
    } catch (error) {
      setHistory([...history, { question, answer: "Error fetching response." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceQuery = async () => {
    const spokenQuestion = await recordAudio();
    setQuestion(spokenQuestion);
    askQuestion();
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Ask Mira</h2>
      <div className="faq-welcome-message">
        <h3>{welcomeMessage}</h3>
      </div>
      <div className="faq-history">
        {history.map((entry, index) => (
          <div key={index} className="faq-history-item">
            <p className="faq-question"><strong>Q:</strong> {entry.question}</p>
            <p className="faq-answer"><strong>A:</strong> {entry.answer}</p>
          </div>
        ))}
      </div>
      <input 
        type="text" 
        className="faq-input" 
        placeholder="Ask a question..." 
        value={question} 
        onChange={(e) => setQuestion(e.target.value)} 
      />
      <div className="faq-buttons">
        <button className="faq-button" onClick={askQuestion}>Ask</button>
        <button className="faq-button faq-voice" onClick={handleVoiceQuery}>🎤 Voice Query</button>
      </div>
      <label className="faq-toggle">
        <input type="checkbox" checked={fullSpeech} onChange={() => setFullSpeech(!fullSpeech)} />
        Read Full Answer
      </label>
      {loading && <p className="faq-loading">Loading...</p>}
      <Link to="/"><button className="faq-back">⌫</button></Link>
    </div>
  );
}





function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("auth") === "true";

  useEffect(() => {
    fetch("http://localhost:5054/api/employees")
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);
  
  const moveServo = (employeeId) => {
    fetch("http://localhost:5054/api/employees/move-motor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Error moving servo:", error));
  };

  return (
    <div>
      <h2>Employees</h2>
      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>
            {employee.name} - {employee.role} - RFID: {employee.rfid}
            <button onClick={() => {
              moveServo(employee.id);  // ✅ Move Servo when clicked
              navigate(`/employee/${employee.id}`);  // ✅ Navigate to Attendance Page
            }}>👁️</button>
          </li>
        ))}
      </ul>
      {isAuthenticated ? (
        <button onClick={() => navigate("/add-employee")}>Go to Add Employees</button>
      ) : (
        <Link to="/login"><button>Admin Login</button></Link>
      )}
      <Link to="/"><button>Back</button></Link>
    </div>
  );
}

function EmployeeAttendance() {
  const { id } = useParams();
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5054/api/attendancelogs`)
      .then((response) => response.json())
      .then((data) => {
        const filteredLogs = data.filter(log => log.employeeId === parseInt(id));
        setAttendance(filteredLogs);
      })
      .catch((error) => {
        console.error("Error fetching attendance:", error);
        setAttendance([]);
      });
  }, [id]);

  return (
    <div>
      <h2>Attendance Records</h2>
      {attendance.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check-In</th>
              <th>Check-Out</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((log, index) => (
              <tr key={index}>
                <td>{new Date(log.checkInTime).toLocaleDateString()}</td>
                <td>{log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : "Not Checked-In"}</td>
                <td>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : "Not Checked-Out"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No attendance records found.</p>
      )}
      <Link to="/employees"><button>Back</button></Link>
    </div>
  );
}

function AddEmployee() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "", rfid: "" });
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("auth") === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    fetch("http://localhost:5054/api/employees")
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error("Error fetching employees:", error));
  }, [isAuthenticated, navigate]);

  const addEmployee = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5054/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newEmployee),
    })
      .then((response) => {
        if (response.status === 401) {
          alert("Unauthorized! Please log in again.");
          localStorage.removeItem("auth");
          localStorage.removeItem("token");
          navigate("/login");
        }
        return response.json();
      })
      .then((data) => setEmployees([...employees, data]))
      .catch((error) => console.error("Error adding employee:", error));
  };

  const deleteEmployee = (id) => {
    fetch(`http://localhost:5054/api/employees/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(() => setEmployees(employees.filter((emp) => emp.id !== id)))
      .catch((error) => console.error("Error deleting employee:", error));
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    navigate("/employees");
  };

  return (
    <div>
      <h2>Add Employee</h2>
      <input type="text" placeholder="Name" onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} />
      <input type="text" placeholder="Role" onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} />
      <input type="text" placeholder="RFID" onChange={(e) => setNewEmployee({ ...newEmployee, rfid: e.target.value })} />
      <button onClick={addEmployee}>Add Employee</button>

      <h3>Existing Employees</h3>
      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>{employee.name} - {employee.role} - RFID: {employee.rfid} <button onClick={() => deleteEmployee(employee.id)}>Delete</button></li>
        ))}
      </ul>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => navigate("/employees")}>Back</button>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("auth") === "true");
  
  return (
    <Router>
      <WakeWordListener />
      <Routes>
        
        <Route path="/" element={<Slideshow />} />
        <Route path="/" element={<MiraScreen />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employee/:id" element={<EmployeeAttendance />} />
        {isAuthenticated && <Route path="/add-employee" element={<AddEmployee />} />}
        <Route path="/faq" element={<FAQChatbot />} /> ✅ Wake Word Navigates Here
        </Routes>
    </Router>
  );
}

export default App;
