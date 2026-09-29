"use client";

import ProtectedPage from "@/components/ProtectedPage";
import ReportsDashboard from "@/modules/reports/pages/ReportsDashboard";
export default function Page() {
  return (
    <ProtectedPage>
      <ReportsDashboard />
    </ProtectedPage>
  );
}
