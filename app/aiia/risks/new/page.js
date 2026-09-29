"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import RisksForm from "@/modules/aiia/pages/RiskForm";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <RisksForm />
      </FrameworkPage>
    </ProtectedPage>
  );
}
