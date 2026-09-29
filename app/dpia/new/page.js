"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import DpiaAssessment from "@/modules/dpia/pages/DpiaAssessment";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="dpia">
        <DpiaAssessment />
      </FrameworkPage>
    </ProtectedPage>
  );
}
