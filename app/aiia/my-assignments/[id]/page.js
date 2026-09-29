"use client";
import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import AssignmentDetailRoute from "@/modules/aiia/pages/AssignmentDetailRout";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <AssignmentDetailRoute match={{ params }} />
      </FrameworkPage>
    </ProtectedPage>
  );
}
