const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY; // ✅ Use .env for security

export const recordAudio = async () => {
  try {
    console.log("🎤 Requesting microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    if (!stream) {
      throw new Error("Microphone not accessible.");
    }

    console.log("✅ Microphone access granted.");
    
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("🎤 Recording stopped.");

        if (audioChunks.length === 0) {
          console.error("❌ No audio recorded.");
          return resolve("No audio detected.");
        }

        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        console.log("🎤 Audio Blob Created:", audioBlob);

        const formData = new FormData();
        formData.append("file", audioBlob, "speech.wav");
        formData.append("model", "whisper-1");

        try {
          const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` },
            body: formData,
          });

          if (!response.ok) {
            throw new Error("❌ Whisper API Request Failed.");
          }

          const data = await response.json();
          console.log("📝 Transcribed Text:", data.text);
          resolve(data.text || "Unknown");

        } catch (error) {
          console.error("❌ Error sending to Whisper API:", error);
          resolve("Error processing audio.");
        }
      };

      mediaRecorder.start();
      console.log("🎤 Recording started...");
      setTimeout(() => {
        mediaRecorder.stop();
      }, 4000); // Record for 4 seconds
    });

  } catch (error) {
    console.error("❌ Microphone Error:", error);
    return "Microphone access denied.";
  }
};
