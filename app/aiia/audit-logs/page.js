"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import AuditLogs from "@/modules/aiia/pages/AuditLogs";
export default function Page() {
  return (
    <ProtectedPage>
      <FrameworkPage moduleKey="aiia">
        <AuditLogs />
      </FrameworkPage>
    </ProtectedPage>
  );
}
