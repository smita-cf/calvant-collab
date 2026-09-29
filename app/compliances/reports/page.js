"use client";

import ProtectedPage from "@/components/ProtectedPage";
import ComplianceReports from "@/modules/integrations/ComplianceReports";
export default function Page() {
  return (
    <ProtectedPage>
      <ComplianceReports />
    </ProtectedPage>
  );
}
