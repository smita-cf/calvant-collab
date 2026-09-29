"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import MyAssignments from "@/modules/aiia/pages/MyAssignments";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <MyAssignments />
      </FrameworkPage>
    </ProtectedPage>
  );
}
