"use client";

import ProtectedPage from "@/components/ProtectedPage";
import NewAssessment from "@/modules/gapAssessment/pages/NewAssessment";
export default function Page() {
  return (
    <ProtectedPage>
      <NewAssessment />
    </ProtectedPage>
  );
}
