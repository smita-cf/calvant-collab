"use client";

import ProtectedPage from "@/components/ProtectedPage";
import MLD from "@/modules/documentation/pages/MLD";
export default function Page() {
  return (
    <ProtectedPage>
      <MLD />
    </ProtectedPage>
  );
}
