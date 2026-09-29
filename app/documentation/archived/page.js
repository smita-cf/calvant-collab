"use client";

import ProtectedPage from "@/components/ProtectedPage";
import Archived from "@/modules/documentation/pages/Archived";
export default function Page() {
  return (
    <ProtectedPage>
      <Archived />
    </ProtectedPage>
  );
}
