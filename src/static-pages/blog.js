"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { Calendar, Search, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchBlogData, debounce } from "../utils/blogUtils";
import ContentLayout from "../components/ContentLayout";
import "./blog.css";

const BlogSkeleton = () => (
  <div className="blog-skeleton-card">
    <div className="blog-skeleton-image"></div>
    <div className="blog-skeleton-content">
      <div className="blog-skeleton-badge"></div>
      <div className="blog-skeleton-title"></div>
      <div className="blog-skeleton-text"></div>
      <div className="blog-skeleton-text"></div>
      <div className="blog-skeleton-footer"></div>
    </div>
  </div>
);

const ImageWithFallback = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  const fallback =
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop";
  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

// Strip HTML tags and decode entities properly
const stripHtml = (html) => {
  if (!html) return "";
  // Decode common entities first so they don't bypass the tag stripper
  const decoded = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
    
  return decoded
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getExcerpt = (post) => {
  if (post.safeExcerpt && post.safeExcerpt.trim()) return stripHtml(post.safeExcerpt);
  const plain = stripHtml(post.content || "");
  return plain.length > 120 ? plain.substring(0, 120) + "..." : plain;
};

const BlogPage = () => {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [blogPosts, setBlogPosts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;
  const router = useRouter();

  const API_BASE = "https://api.calvant.com/blog-service/api";

  const updateDebouncedSearch = useCallback(
    debounce((query) => setDebouncedSearch(query), 300),
    []
  );

  useEffect(() => {
    updateDebouncedSearch(searchQuery);
  }, [searchQuery, updateDebouncedSearch]);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const { posts, categories } = await fetchBlogData(axios, API_BASE, force);
      setBlogPosts(posts);
      setDbCategories(categories);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Unable to load blog posts. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const featuredCount = blogPosts.filter((p) => p.featured).length;
    return [
      { value: "all", label: "All Articles", count: blogPosts.length },
      { value: "featured", label: "Featured", count: featuredCount },
      ...dbCategories.map((dbCat) => {
        const normalizedCat = dbCat.name?.toLowerCase() || "";
        return {
          value: normalizedCat,
          label: dbCat.name,
          count: blogPosts.filter(
            (p) => p.category?.toLowerCase() === normalizedCat
          ).length,
        };
      }),
    ];
  }, [blogPosts, dbCategories]);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const excerpt = getExcerpt(post);
      const matchesSearch =
        post.safeTitle.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        excerpt.toLowerCase().includes(debouncedSearch.toLowerCase());

      if (activeCategory === "featured") return post.featured && matchesSearch;

      const postCat = post.category?.toLowerCase() || "";
      const matchesCategory =
        activeCategory === "all" || postCat === activeCategory;
      return matchesCategory && matchesSearch;
    });
  }, [blogPosts, debouncedSearch, activeCategory]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, debouncedSearch]);

  const hero = (
    <div className="blog-hero-content">
      <span className="professional-badge">Expert Insights</span>
      <h1 className="post-header-title" style={{ fontSize: "48px", fontWeight: "800", color: "var(--cv-text-primary)" }}>
        Knowledge for a Secure Future
      </h1>
      <p style={{ fontSize: "18px", color: "var(--cv-text-secondary)", marginTop: "16px" }}>
        Deep dives into ISO 27001, global compliance standards, and cybersecurity best practices.
      </p>
    </div>
  );

  return (
    <ContentLayout heroSection={hero}>
        {/* Primary */}
        <title>Blog - CalVant | Compliance &amp; Security Insights</title>
        <meta name="description" content="Expert articles on ISO 27001, SOC 2, ISO 27701, ISO 42001, GDPR, and enterprise risk management. Stay ahead in information security and compliance." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://app.calvant.com/blog" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CalVant" />
        <meta property="og:title" content="CalVant Blog | Compliance &amp; Security Insights" />
        <meta property="og:description" content="Expert articles on ISO 27001, SOC 2, GDPR, and enterprise risk management from CalVant's compliance specialists." />
        <meta property="og:url" content="https://app.calvant.com/blog" />
        <meta property="og:image" content="https://app.calvant.com/CalVant Logo.svg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CalVant Blog | Compliance &amp; Security Insights" />
        <meta name="twitter:description" content="Expert articles on ISO 27001, SOC 2, GDPR, and enterprise risk management." />
        <meta name="twitter:image" content="https://app.calvant.com/CalVant Logo.svg" />

      {/* FILTER BAR */}
      <section className="blog-filter-section">
        <div className="blog-container">
          <div className="blog-filter-bar">
            <div className="blog-search">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="blog-categories">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  className={activeCategory === cat.value ? "active" : ""}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  <span className="label">{cat.label}</span>
                  <span className="count">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
          {filteredPosts.length > 0 && (
            <div className="blog-results-info">
              {filteredPosts.length}{" "}
              {filteredPosts.length === 1 ? "article" : "articles"} found
            </div>
          )}
        </div>
      </section>

      {/* BLOG GRID */}
      <section className="blog-grid-section">
        <div className="blog-container">
          {loading ? (
            <div className="blog-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <BlogSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="blog-error">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button className="btn-primary" onClick={() => loadData(true)}>
                Try Again
              </button>
            </div>
          ) : currentPosts.length > 0 ? (
            <>
              <div className="blog-grid">
                {currentPosts.map((post) => {
                  const excerpt = getExcerpt(post);
                  return (
                    <article
                      key={post.id}
                      className="blog-card"
                      onClick={() => router.push(`/blog/${post.slug}`)}
                    >
                      <div className="blog-card-image">
                        <ImageWithFallback
                          src={post.imageUrl}
                          alt={post.safeTitle}
                        />
                        <div className="blog-card-category">{post.category}</div>
                      </div>
                      <div className="blog-card-content">
                        <div className="blog-card-meta">
                          <span className="meta-item date">
                            <Calendar size={14} />
                            {post.formattedDate}
                          </span>
                        </div>
                        <h3 className="blog-card-title">{post.safeTitle}</h3>
                        <div className="blog-card-footer">
                          <span className="read-more">
                            Read Article <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="blog-pagination">
                  <button
                    className="pagination-prev"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    &#8592;
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={currentPage === i + 1 ? "active" : ""}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="pagination-next"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Next page"
                  >
                    &#8594;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="blog-empty">
              <div className="blog-empty-icon">
                <Search size={64} strokeWidth={1.5} />
              </div>
              <h3>No articles found</h3>
              <p>We couldn't find any articles matching your search or filters.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

    </ContentLayout>
  );
};

export default BlogPage;

