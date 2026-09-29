"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import PlanAssessmentModal from "@/modules/aiia/components/PlanAssessmentModal";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <PlanAssessmentModal />
      </FrameworkPage>
    </ProtectedPage>
  );
}
