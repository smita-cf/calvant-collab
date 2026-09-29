"use client";
import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import ComplianceDashboard from "@/modules/dpia/pages/ComplianceDashboard";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="dpia">
        <ComplianceDashboard match={{ params }} />
      </FrameworkPage>
    </ProtectedPage>
  );
}
