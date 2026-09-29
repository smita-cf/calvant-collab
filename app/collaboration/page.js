import { getPageMetadata } from "@/utils/getPageMetadata";
import CollaborationPageClient from "./CollaborationPageClient";

export const dynamic = "force-dynamic";

const BACKEND_API = process.env.COLLABORATION_SERVICE_URL || "http://localhost:4035/api/collaboration";

async function getCollaborationData() {
  try {
    const res = await fetch(`${BACKEND_API}`, {
      cache: "no-store",
      headers: {
        Origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
    });
    if (!res.ok) {
      console.warn(`[getCollaborationData] Backend response status: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn("[getCollaborationData] Fetch failed, fallback to client default:", err.message);
    return null;
  }
}

export async function generateMetadata() {
  const data = await getCollaborationData();
  const pc = data || {};

  const title = pc.heroTitle
    ? `${pc.heroTitle} ${pc.heroTitleHighlight || ""} | CalVant Collaboration`.trim()
    : "Compliance Collaboration Platform for Security & Audit Teams | CalVant";

  const description =
    pc.heroDescription ||
    "Unify security, DevOps, legal, and external auditors in one real-time compliance collaboration hub with CalVant.";

  return getPageMetadata("/collaboration", {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://calvant.com"}/collaboration`,
    },
  });
}

export default async function Page() {
  const data = await getCollaborationData();
  return <CollaborationPageClient initialData={data} />;
}
