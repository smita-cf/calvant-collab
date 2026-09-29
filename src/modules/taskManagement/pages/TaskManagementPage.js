import React from "react";
import TaskManagementSection from "../components/TaskManagementSection";
import MyTasksSection from "../components/MyTasksSection";

const TaskManagementPage = () => {
  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* TOP: TASK MANAGEMENT */}
      <TaskManagementSection />

      {/* BOTTOM: MY TASKS */}
      {/* <MyTasksSection /> */}
    </div>
  );
};

export default TaskManagementPage;
