"use client";

import ProtectedPage from "@/components/ProtectedPage";
import ControlsPage from "@/modules/documentation/pages/ControlPage";
export default function Page() {
  return (
    <ProtectedPage>
      <ControlsPage />
    </ProtectedPage>
  );
}
