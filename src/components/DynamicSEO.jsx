"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSEO } from "../context/SEOContext";

const DEFAULT_TITLE = "CalVant | ISO Compliance & Risk Management Platform";
const DEFAULT_DESC = "Empower your organization with CalVant's industry-leading ISO 27001 & 27701 compliance platform.";
const DEFAULT_KEYWORDS = "ISO 27001, ISO 27701, Compliance, Risk Management, Cybersecurity";

const DynamicSEO = () => {
  const pathname = usePathname();
  const { getSEOForPath, loading } = useSEO();

  useEffect(() => {
    if (loading) return;

    const seo = getSEOForPath(pathname);
    const title = seo?.title || DEFAULT_TITLE;
    const description = seo?.description || DEFAULT_DESC;
    const keywords = seo?.keywords || DEFAULT_KEYWORDS;
    const ogImage = seo?.ogImage || "/favicon_large.png";
    const canonical = seo?.canonical || window.location.href;
    const robots = seo?.robots || "index, follow";

    document.title = title;

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "title", title);
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta("name", "robots", robots);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", window.location.href);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", ogImage);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:url", window.location.href);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);

  }, [pathname, loading, getSEOForPath]);

  return null;
};

export default DynamicSEO;