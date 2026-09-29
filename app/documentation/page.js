"use client";

import dynamic from "next/dynamic";
import ProtectedPage from "@/components/ProtectedPage";

const Documentation = dynamic(
  () => import("@/modules/documentation/pages/Documentation"),
  { ssr: false }
);

export default function Page() {
  return (
    <ProtectedPage>
      <Documentation />
    </ProtectedPage>
  );
}
