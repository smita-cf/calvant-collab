import { getPageMetadata } from "@/utils/getPageMetadata";
import PricingPage from "@/modules/billing/pages/PricingPage";

export async function generateMetadata() {
  return getPageMetadata("/pricing", {
    title: "Pricing | CalVant",
    description:
      "Simple, transparent pricing for CalVant's compliance and risk management platform. Start free, scale as you grow.",
  });
}

export default function Page() {
  return <PricingPage />;
}
