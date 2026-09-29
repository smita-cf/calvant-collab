import { Suspense } from "react";
import { getPageMetadata } from "@/utils/getPageMetadata";
import SignupPage from "@/modules/billing/pages/SignupPage";

export async function generateMetadata() {
  return getPageMetadata("/signup", {
    title: "Start your free trial | CalVant",
    description: "Create your CalVant account and start your 14-day free trial — no card required.",
  });
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignupPage />
    </Suspense>
  );
}
