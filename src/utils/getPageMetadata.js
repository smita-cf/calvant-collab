const BASE_URL = process.env.NEXT_PUBLIC_CFTB || "https://api.calvant.com";

const normalizePath = (path) => {
  if (!path) return "/";
  return path.toLowerCase().trim().replace(/\/$/, "") || "/";
};

export async function getPageMetadata(path, fallback = {}) {
  try {
    const normalizedPath = normalizePath(path);

    const res = await fetch(
      `${BASE_URL}/seo-form/api/seo/by-path?path=${encodeURIComponent(normalizedPath)}`,
      { next: { revalidate: 3600 } },
    );

    // No CMS entry for this path — use fallback silently
    if (res.status === 404) return fallback;
    if (!res.ok) throw new Error(`SEO fetch failed: ${res.status}`);

    const entry = await res.json();

    // Decode advanced JSON packed into metaKeywords
    let advanced = {};
    const keywordData = entry.metaKeywords || "";
    if (keywordData.includes(" | {")) {
      try {
        advanced = JSON.parse(keywordData.split(" | ")[1]);
      } catch {
        console.warn("[SEO] Malformed JSON in metaKeywords for path:", path);
      }
    }

    const title = entry.pageTitle || fallback.title;
    const description = entry.metaDesc || fallback.description;
    const keywords = keywordData.split(" | ")[0] || "";
    const ogImage = advanced.og_img;
    const canonical =
      advanced.canonical || `https://calvant.com${normalizedPath}`;

    return {
      title,
      description,
      keywords,
      robots: advanced.robots || "index, follow",
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "CalVant",
        type: "website",
        ...(ogImage && { images: [{ url: ogImage }] }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(ogImage && { images: [ogImage] }),
      },
      // Pass through any extra fallback fields (e.g. verification)
      ...Object.fromEntries(
        Object.entries(fallback).filter(
          ([key]) => !["title", "description", "alternates"].includes(key),
        ),
      ),
    };
  } catch {
    return fallback;
  }
}
