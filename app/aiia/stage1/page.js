"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import Stage1List from "@/modules/aiia/pages/ManageAiiaModal";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <Stage1List />
      </FrameworkPage>
    </ProtectedPage>
  );
}
