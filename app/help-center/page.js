"use client";

import dynamic from "next/dynamic";
import ProtectedPage from "@/components/ProtectedPage";

const HelpCenterHome = dynamic(
  () => import("@/modules/helpCenter/pages/HelpCenterHome"),
  { ssr: false }
);

export default function Page() {
  return (
    // <ProtectedPage>
      <HelpCenterHome />
    // </ProtectedPage>
  );
}
