"use client";

import ProtectedPage from "@/components/ProtectedPage";
import SupportCentrePage from "@/modules/support/pages/SupportCentrePage";

export default function Page() {
  return (
    <ProtectedPage>
      <SupportCentrePage />
    </ProtectedPage>
  );
}
