import React, { useState, useEffect, useRef } from "react";

const LiveChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLive, setIsLive] = useState(true); // Track status for UI
  const timerRef = useRef(null); // Holds the interval ID
  const chatContainerRef = useRef(null);

  const startStream = () => {
    if (timerRef.current) return; // Prevent multiple intervals

    setIsLive(true);
    timerRef.current = setInterval(() => {
      const newMessage = {
        id: Date.now(),
        text: `New message at ${new Date().toLocaleTimeString()}`,
      };

      setMessages((prev) => [...prev.slice(-49), newMessage]);
    }, 200);
  };

  const stopStream = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null; // Reset the ref
      setIsLive(false);
    }
  };

  // Start on mount, cleanup on unmount
  useEffect(() => {
    startStream();
    return () => clearInterval(timerRef.current);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={isLive ? stopStream : startStream}
          style={{
            padding: "8px 16px",
            backgroundColor: isLive ? "#ff4d4f" : "#52c41a",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isLive ? "Stop Stream" : "Resume Stream"}
        </button>
        <span style={{ marginLeft: "10px" }}>
          Status: <strong>{isLive ? "🔴 LIVE" : "⚪ PAUSED"}</strong>
        </span>
      </div>

      <div
        ref={chatContainerRef}
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} style={{ padding: "4px 0" }}>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveChat;
