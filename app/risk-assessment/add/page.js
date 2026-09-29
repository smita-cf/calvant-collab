//app/risk-assessment/add/page.js 

"use client";

import ProtectedPage from "@/components/ProtectedPage";
import AddRisk from "@/modules/riskAssesment/pages/AddRisk";

export default function Page() {
  return (
    <ProtectedPage>
      <AddRisk />
    </ProtectedPage>
  );
}
