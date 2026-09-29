"use client";

import ProtectedPage from "@/components/ProtectedPage";
import TaskManagementPage from "@/modules/taskManagement/pages/TaskManagementPage";
export default function Page() {
  return (
    <ProtectedPage>
      <TaskManagementPage />
    </ProtectedPage>
  );
}
