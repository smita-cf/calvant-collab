"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import Stage2List from "@/modules/aiia/pages/Stage2List";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <Stage2List />
      </FrameworkPage>
    </ProtectedPage>
  );
}
