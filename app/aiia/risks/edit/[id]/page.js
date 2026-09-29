"use client";
import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import RisksForm from "@/modules/aiia/pages/RiskForm";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <RisksForm match={{ params }} />
      </FrameworkPage>
    </ProtectedPage>
  );
}
