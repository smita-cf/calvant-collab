"use client";

import dynamic from "next/dynamic";
import ProtectedPage from "@/components/ProtectedPage";

const RiskAssessment = dynamic(
  () => import("@/modules/riskAssesment/pages/RiskAssessment"),
  { ssr: false }
);

export default function Page() {
  return (
    <ProtectedPage>
      <RiskAssessment />
    </ProtectedPage>
  );
}
