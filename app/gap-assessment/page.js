"use client";

import ProtectedPage from "@/components/ProtectedPage";
import GapAssessmentDashboard from "@/modules/gapAssessment/pages/GapAssessment";
export default function Page() {
  return (
    <ProtectedPage>
      <GapAssessmentDashboard />
    </ProtectedPage>
  );
}
