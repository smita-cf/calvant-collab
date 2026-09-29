"use client";
import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import PlanAssessmentModal from "@/modules/aiia/components/PlanAssessmentModal";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <PlanAssessmentModal match={{ params }} />
      </FrameworkPage>
    </ProtectedPage>
  );
}
