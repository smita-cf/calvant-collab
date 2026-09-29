import { notFound, redirect } from "next/navigation";
import { getPageMetadata } from "@/utils/getPageMetadata";
import { resolveStaticRoute } from "@/utils/frameworkStaticRoutes";
import FrameworkPageClient from "./FrameworkPageClient";

export const dynamic = "force-dynamic";

const API_BASE = "https://api.calvant.com/framework/api";

// Native fetch here is automatically memoized per-request by Next.js —
// generateMetadata and Page both call this with the same args, so it
// only actually hits the network once per request.
async function getFramework(id) {
  try {
    const res = await fetch(`${API_BASE}/frameworks/${id}`, {
      

      next: { revalidate: 0 },
      headers: {
        Origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[getFramework] non-ok response: ${res.status} ${res.statusText} for id=${id}`);
      console.error(`[getFramework] response body:`, body);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[getFramework] fetch threw for id=${id}:`, err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = params;
  const framework = await getFramework(id);
  const pc = framework?.pageContent;

  if (!framework) {
    return getPageMetadata(`/frameworks/${id}`, {
      title: "Framework not found | CalVant",
      description: "This compliance framework could not be found.",
    });
  }

  const title = pc?.heroTitle
    ? `${pc.heroTitle} ${pc.heroTitleHighlight || ""} | CalVant`.trim()
    : `${framework.name || framework.label} Compliance | CalVant`;

  const description =
    pc?.heroDescription ||
    `Learn how CalVant helps you operationalize ${framework.name || framework.label} compliance.`;

  return getPageMetadata(`/frameworks/${id}`, {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/frameworks/${id}`,
    },
  });
}

export default async function Page({ params }) {
  const { id } = params;
    console.log("PAGE HIT for id:", id);
  const framework = await getFramework(id);
  console.log("framework result:", framework);

  if (!framework) {
    notFound();
  }

  // No CMS content? Send a real HTTP redirect to the static page if one
  // exists, before any HTML streams. This happens server-side — no JS
  // execution required for crawlers or slow clients to land in the
  // right place.
  if (!framework.pageContent) {
    const staticRoute = resolveStaticRoute(framework);
    if (staticRoute) {
      redirect(staticRoute);
    }
  }

  return <FrameworkPageClient framework={framework} />;
}