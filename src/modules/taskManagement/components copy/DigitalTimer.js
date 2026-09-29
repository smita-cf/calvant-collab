import React, { useEffect, useState } from "react";

const DigitalTimer = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setTime(new Date()), 50);
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (date) => {
    const pad = (num, size = 2) => String(num).padStart(size, "0");
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    

    // Add this for date
    const day = pad(date.getDate());
    const month = date.toLocaleString("en-US", { month: "short" }); // e.g., "Nov"
    const year = date.getFullYear();

    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div style={{
      fontFamily: "monospace",
      fontWeight: "bold",
      color: "#2c3e50",
      fontSize: "1.1rem",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "20px",
      userSelect: "none",
    }}>
      <span>        </span>
      <span>{formatTime(time)}</span>
    </div>
  );
};

export default DigitalTimer;
