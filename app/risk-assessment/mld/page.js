"use client";

import ProtectedPage from "@/components/ProtectedPage";
import SoAMLD from "@/modules/documentation/pages/SoAMLD";
export default function Page() {
  return (
    <ProtectedPage>
      <SoAMLD />
    </ProtectedPage>
  );
}
