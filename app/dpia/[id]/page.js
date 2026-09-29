"use client";
import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import DpiaAssessment from "@/modules/dpia/pages/DpiaAssessment";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="dpia">
        <DpiaAssessment match={{ params }} />
      </FrameworkPage>
    </ProtectedPage>
  );
}
