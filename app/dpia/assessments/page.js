"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import ViewAssessments from "@/modules/dpia/pages/ViewAssessments";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="dpia">
        <ViewAssessments />
      </FrameworkPage>
    </ProtectedPage>
  );
}
