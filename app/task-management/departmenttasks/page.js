"use client";

import ProtectedPage from "@/components/ProtectedPage";
import DepartmentTask from "@/modules/taskManagement/pages/departmenttask";
export default function Page() {
  return (
    <ProtectedPage>
      <DepartmentTask />
    </ProtectedPage>
  );
}
