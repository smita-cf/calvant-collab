"use client";

import ProtectedPage from "@/components/ProtectedPage";
import TrustCentrePage from "@/modules/trustcentre/pages/TrustCentrePage";
export default function Page() {
  return (
    <ProtectedPage>
      <TrustCentrePage />
    </ProtectedPage>
  );
}
