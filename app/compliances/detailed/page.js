"use client";

import ProtectedPage from "@/components/ProtectedPage";
import IntegrationsDashboard from "@/modules/integrations/integrationdashboard";
export default function Page() {
  return (
    <ProtectedPage>
      <IntegrationsDashboard />
    </ProtectedPage>
  );
}
