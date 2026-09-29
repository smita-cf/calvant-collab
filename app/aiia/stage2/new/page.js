"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import Stage2Form from "@/modules/dpia/components/Stage2Form";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <Stage2Form />
      </FrameworkPage>
    </ProtectedPage>
  );
}
