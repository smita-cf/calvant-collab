import React from "react";

import MyTasksSection from "../components/MyTasksSection";

const departmenttask = () => {
  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* TOP: TASK MANAGEMENT */}


      {/* BOTTOM: MY TASKS */}
      <MyTasksSection />
    </div>
  );
};

export default departmenttask;
