"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ArrowLeft, Home } from "lucide-react";
import { helpMarkdownComponents } from "@/components/shared/markdownComponents";

// ── helpers ────────────────────────────────────────────────────────────────

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Pull every H2/H3 out of the raw markdown so the left nav mirrors the
// document's own headings exactly — no separately maintained TOC data.
const extractToc = (markdown) => {
  const lines = markdown.split("\n");
  const toc = [];
  const seen = {};
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.*)$/);
    const m3 = line.match(/^###\s+(.*)$/);
    const m4 = line.match(/^####\s+(.*)$/);
    const level = m2 ? 2 : m3 ? 3 : m4 ? 4 : null;
    if (!level) continue;
    let text = (m2 ? m2[1] : m3 ? m3[1] : m4[1]).trim();

    // Strip HTML tags so the sidebar TOC looks clean
    text = text.replace(/<\/?[^>]+(>|$)/g, "").trim();

    let slug = slugify(text);
    if (seen[slug] != null) {
      seen[slug] += 1;
      slug = `${slug}-${seen[slug]}`;
    } else {
      seen[slug] = 0;
    }
    toc.push({ level, text, slug });
  }
  return toc;
};

// Docs live under /public/docs, but the markdown itself is fetched and
// rendered from an unrelated page URL (/help-center/<slug>). Any relative
// image path in the source (e.g. "images/foo.png" or "./foo.png") would
// otherwise resolve against the current page URL and 404. Absolute paths
// (starting with "/"), and full http(s)/data URLs, are left untouched.
const resolveDocAssetUrl = (src) => {
  if (!src) return src;
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:") || src.startsWith("/")) {
    return src;
  }
  return `/docs/${src.replace(/^\.?\//, "")}`;
};

const HelpCenterArticle = ({ slug }) => {
  const router = useRouter();
  const articleRef = useRef(null);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | notfound

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const manifestRes = await fetch("/docs/help-manifest.json");
        const manifest = await manifestRes.json();
        const allModules = [...(manifest.modules || []), ...(manifest.infosecModules || [])];
        const mod = allModules.find((m) => m.slug === slug);
        let type = "module";
        if (manifest.infosecModules?.some((m) => m.slug === slug)) {
          type = "infosec";
        }

        if (!mod) {
          if (!cancelled) setStatus("notfound");
          return;
        }

        const docRes = await fetch(mod.file);
        const text = await docRes.text();

        if (!cancelled) {
          setModuleInfo({ ...mod, type });
          setContent(text);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) setStatus("notfound");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const toc = useMemo(() => (content ? extractToc(content) : []), [content]);

  // Plain visual components — no id logic here. IDs are stamped onto the
  // real DOM nodes after render (see effect below), so they can never drift
  // out of sync with the TOC list.
  const components = useMemo(
    () => ({
      ...helpMarkdownComponents,
      h2: ({ node, ...props }) => (
        <h2
          className="text-lg font-bold text-slate-900 mt-8 mb-3 scroll-mt-24 pb-2 border-b border-slate-100"
          {...props}
        />
      ),
      h3: ({ node, ...props }) => (
        <h3
          className="text-base font-semibold text-slate-800 mt-6 mb-2 scroll-mt-24"
          {...props}
        />
      ),
      h4: ({ node, children, ...props }) => (
        <h4
          className={`${shouldHideHeading(children) ? "sr-only" : "text-sm font-semibold text-slate-800 mt-5 mb-2"
            } scroll-mt-24`}
          {...props}
        >
          {children}
        </h4>
      ),
      h5: ({ node, children, ...props }) => (
        <h5
          className={`${shouldHideHeading(children) ? "sr-only" : "text-sm font-semibold text-slate-800 mt-4 mb-2"
            } scroll-mt-24`}
          {...props}
        >
          {children}
        </h5>
      ),
      img: ({ node, src, ...props }) => (
        <img
          className="rounded-lg border border-slate-200 shadow-sm my-4 w-full block"
          loading="lazy"
          src={resolveDocAssetUrl(src)}
          {...props}
        />
      ),
      li: ({ node, children, className, ...props }) => {
        let text = "";
        const extractText = (child) => {
          if (typeof child === "string") return child;
          if (child && child.props && child.props.children) {
            if (Array.isArray(child.props.children)) {
              return child.props.children.map(extractText).join("");
            }
            return extractText(child.props.children);
          }
          return "";
        };

        if (Array.isArray(children)) {
          text = children.map(extractText).join("");
        } else {
          text = extractText(children);
        }

        const isAlphaList = /^[a-zA-Z]\./.test(text.trim());

        return (
          <li
            className={`text-sm text-slate-700 ${isAlphaList ? "list-none" : ""} ${className || ""}`}
            {...props}
          >
            {children}
          </li>
        );
      },
      a: ({ node, href, children, ...props }) => {
        // If it's an internal link, open in a new tab
        if (href && href.startsWith("/")) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              {children}
            </a>
          );
        }
        // If it's a hash link, scroll to it smoothly
        if (href && href.startsWith("#")) {
          return (
            <a
              href={href}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(href.substring(1));
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              {children}
            </a>
          );
        }
        // External link
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
            {...props}
          >
            {children}
          </a>
        );
      },
    }),
    [router]
  );

  // After the markdown has actually painted, walk the H2/H3 nodes in
  // document order and assign them the exact same slugs the left nav is
  // using — guarantees TOC clicks always find a matching element.
  useEffect(() => {
    if (status !== "ready" || !articleRef.current) return;
    const headings = articleRef.current.querySelectorAll("h2, h3, h4, h5");
    headings.forEach((el, i) => {
      if (toc[i]) el.id = toc[i].slug;
    });
  }, [toc, status]);

  const handleTocClick = (slug) => {
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Helper to determine if a heading should be hidden from the UI but kept in the TOC.
  // Matches patterns like "1A. ", "2B. ", "1A.1. "
  const shouldHideHeading = (children) => {
    if (!children) return false;
    const text = Array.isArray(children) ? children.join("") : String(children);
    return /^\d+[a-zA-Z](\.\d+)?\.\s/.test(text);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <p className="text-slate-500 text-sm">
          We couldn't find a guide for "{slug}".
        </p>
        <button
          onClick={() => router.push("/help-center")}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          Back to Help Center
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() =>
              router.push(
                moduleInfo?.type === "infosec"
                  ? "/help-center?view=infosec_modules"
                  : "/help-center?view=modules"
              )
            }
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors font-medium"
          >
            <Home size={14} />
            {moduleInfo?.type === "infosec" ? "Frameworks" : "Help Center"}
          </button>
          <span>/</span>
          <span className="text-slate-800 font-medium">{moduleInfo?.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 flex-shrink-0">
          <button
            onClick={() =>
              router.push(
                moduleInfo?.type === "infosec"
                  ? "/help-center?view=infosec_modules"
                  : "/help-center?view=modules"
              )
            }
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-4"
          >
            <ArrowLeft size={13} />
            {moduleInfo?.type === "infosec" ? "All Steps" : "All Modules"}
          </button>

          <div className="lg:sticky lg:top-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
              In this article
            </p>
            <nav className="space-y-0.5 border-l border-slate-200">
              {toc.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => handleTocClick(item.slug)}
                  className={`block w-full text-left text-xs py-1.5 border-l-2 -ml-px transition-colors ${item.level === 5 ? "pl-12" : item.level === 4 ? "pl-10" : item.level === 3 ? "pl-7" : "pl-4"
                    } border-transparent hover:border-blue-400 text-slate-500 hover:text-blue-600`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <article
          ref={articleRef}
          className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm px-6 sm:px-10 py-8"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
};

export default HelpCenterArticle;