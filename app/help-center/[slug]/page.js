"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";

const HelpCenterArticle = dynamic(
  () => import("@/modules/helpCenter/pages/HelpCenterArticle"),
  { ssr: false }
);

export default function Page() {
  const params = useParams();
  return (
    // <ProtectedPage>
      <HelpCenterArticle slug={params?.slug} />
    // </ProtectedPage>
  );
}
