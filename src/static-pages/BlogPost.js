"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Calendar,
  ChevronLeft,
  Clock,
  ArrowRight,
  Share2,
  AlertCircle,
} from "lucide-react";
import { fetchBlogData, getRelatedPosts } from "../utils/blogUtils";
import ContentLayout from "../components/ContentLayout";
import "./blog.css";

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

const BlogPost = ({ slug: propSlug, match }) => {
  const slug = propSlug || match?.params?.slug;
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const API_BASE = "https://api.calvant.com/blog-service/api";

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        totalHeight > 0 ? (window.pageYOffset / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { posts } = await fetchBlogData(axios, API_BASE);
      setAllPosts(posts);

      const foundPost = posts.find((p) => p.slug === slug);
      if (foundPost) {
        setPost(foundPost);
      } else {
        setError("404"); // Not found
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Unable to load the article. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const relatedPosts = useMemo(() => {
    return getRelatedPosts(post, allPosts);
  }, [allPosts, post]);

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-skeleton-detail">
          <div className="blog-skeleton-hero"></div>
          <div className="blog-container narrow">
            <div
              className="blog-skeleton-text-full"
              style={{
                height: "300px",
                borderRadius: "16px",
                margin: "40px 0",
              }}
            ></div>
            <div className="blog-skeleton-text-full"></div>
            <div className="blog-skeleton-text-full"></div>
            <div className="blog-skeleton-text-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error === "404") {
    return (
      <div className="blog-page">
        <div className="blog-empty">
          <AlertCircle size={48} />
          <h2>Article not found</h2>
          <p>The post you are looking for might have been moved or deleted.</p>
          <button onClick={() => router.push("/blog")}>Back to Blog</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-page">
        <div className="blog-error">
          <AlertCircle size={48} />
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => loadData()}>Try Again</button>
        </div>
      </div>
    );
  }

  const hero = (
    <div className="post-hero-refined">
      <div className="post-hero-top">
        <button className="back-link" onClick={() => router.push("/blog")}>
          <ChevronLeft size={16} /> Back to Blog
        </button>
        <span className="professional-badge">{post.category}</span>
      </div>

      <h1 className="post-hero-title">{post.safeTitle}</h1>

      <div className="post-hero-meta">
        <div className="meta-item">
          <Calendar size={18} />
          <span>{post.formattedDate}</span>
        </div>
        <div className="meta-item">
          <Clock size={18} />
          <span>{post.readTime} read</span>
        </div>
      </div>
    </div>
  );

  return (
    <ContentLayout narrow heroSection={hero}>
      <Helmet>
        {/* Primary */}
        <title>{post.safeTitle} - CalVant Blog</title>
        <meta
          name="description"
          content={post.safeExcerpt?.substring(0, 160)}
        />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href={`https://app.calvant.com/blog/${post.slug}`}
        />

        {/* Open Graph - Article */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="CalVant" />
        <meta
          property="og:title"
          content={`${post.safeTitle} - CalVant Blog`}
        />
        <meta
          property="og:description"
          content={post.safeExcerpt?.substring(0, 160)}
        />
        <meta
          property="og:url"
          content={`https://app.calvant.com/blog/${post.slug}`}
        />
        <meta property="og:image" content={post.imageUrl} />
        <meta property="article:published_time" content={post.createdAt} />
        <meta property="article:section" content={post.category} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${post.safeTitle} - CalVant Blog`}
        />
        <meta
          name="twitter:description"
          content={post.safeExcerpt?.substring(0, 160)}
        />
        <meta name="twitter:image" content={post.imageUrl} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.safeTitle,
            description: post.safeExcerpt?.substring(0, 160),
            image: post.imageUrl,
            datePublished: post.createdAt,
            dateModified: post.updatedAt || post.createdAt,
            url: `https://app.calvant.com/blog/${post.slug}`,
            author: {
              "@type": "Organization",
              name: "CalVant",
              url: "https://app.calvant.com",
            },
            publisher: {
              "@type": "Organization",
              name: "CalVant",
              logo: {
                "@type": "ImageObject",
                url: "https://app.calvant.com/CalVant Logo.svg",
              },
            },
            articleSection: post.category,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://app.calvant.com/blog/${post.slug}`,
            },
          })}
        </script>
      </Helmet>

      {/* FEATURED IMAGE — eager load for LCP */}
      <div className="post-featured-image">
        <img
          src={post.imageUrl}
          alt={post.safeTitle}
          loading="eager"
          fetchpriority="high"
        />
      </div>

      {/* CONTENT */}
      <div
        className="post-body-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* RELATED POSTS (OUTSIDE OF NARROW CONTAINER) */}
      {relatedPosts.length > 0 && (
        <div
          className="professional-container"
          style={{ marginTop: "80px", maxWidth: "var(--cv-container)" }}
        >
          <h2
            className="professional-section-title"
            style={{ textAlign: "center" }}
          >
            Other Articles
          </h2>
          <div className="professional-blog-grid">
            {relatedPosts.map((rp) => (
              <article
                key={rp.id}
                className="blog-card"
                onClick={() => router.push(`/blog/${rp.slug}`)}
              >
                <div className="blog-card-image">
                  <ImageWithFallback src={rp.imageUrl} alt={rp.safeTitle} />
                  <div className="blog-card-category">{rp.category}</div>
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="meta-item date">
                      <Calendar size={14} />
                      {rp.formattedDate}
                    </span>
                  </div>
                  <h3 className="blog-card-title">{rp.safeTitle}</h3>
                  <div className="blog-card-footer">
                    <span className="read-more">
                      Read Article <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </ContentLayout>
  );
};

export default BlogPost;
