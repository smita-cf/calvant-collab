"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import RisksList from "@/modules/aiia/pages/RiskList";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <RisksList />
      </FrameworkPage>
    </ProtectedPage>
  );
}
