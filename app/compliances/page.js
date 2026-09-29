"use client";

import ProtectedPage from "@/components/ProtectedPage";
import Compliances from "@/modules/integrations/Compliances";
export default function Page() {
  return (
    <ProtectedPage>
      <Compliances />
    </ProtectedPage>
  );
}
