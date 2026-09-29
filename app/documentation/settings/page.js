"use client";

import ProtectedPage from "@/components/ProtectedPage";
import DocumentationSettingsPage from "@/modules/documentation/pages/DocumentationSettingsPage";
export default function Page() {
  return (
    <ProtectedPage>
      <DocumentationSettingsPage />
    </ProtectedPage>
  );
}
