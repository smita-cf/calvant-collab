"use client";
import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import Stage2Form from "@/modules/dpia/components/Stage2Form";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <Stage2Form match={{ params }} />
      </FrameworkPage>
    </ProtectedPage>
  );
}
