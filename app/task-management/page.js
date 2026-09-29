"use client";

import ProtectedPage from "@/components/ProtectedPage";
import TaskManagementDashboard from "@/modules/taskManagement/pages/TaskManagementDashboard";
export default function Page() {
  return (
    <ProtectedPage>
      <TaskManagementDashboard />
    </ProtectedPage>
  );
}
