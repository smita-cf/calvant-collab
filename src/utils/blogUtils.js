import Image from "next/image";
/**
 * blogUtils.js - Centralized logic for blog data normalization, caching, and utilities.
 */

// In-memory cache for blog data
let blogCache = {
  posts: [],
  categories: [],
  lastFetched: null,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Renders image URLs within HTML content as <Image> tags.
 * Preserves legacy behavior for plain-text image links.
 */
export const renderContentWithImages = (htmlContent) => {
  if (!htmlContent) return "";
  const regex = /(^|>|\s)(https?:\/\/[^\s<"]+\.(?:png|jpg|jpeg|gif|webp|svg)(?:[?#][^\s<"]*)?)(\s|<|$)/gi;
  return htmlContent.replace(regex, '$1<Image src="$2" style="max-width: 100%; border-radius: 8px; margin: 16px 0; display: block;" alt="Embedded Image" />$3');
};

/**
 * Normalizes blog data from the API to handle inconsistencies.
 */
export const normalizeBlogData = (post, index = 0) => {
  if (!post) return null;

  // 1. Handle ID
  const id = post.id || post._id || `fallback-id-${index}`;

  // 2. Handle Slug
  const slug = post.slugUrl || post.slug || `post-${id}`;

  // 3. Handle Image URL with fallback
  const fallbackImage = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop";
  let imageUrl = fallbackImage;
  
  if (typeof post.image === "string" && post.image.trim() !== "") {
    imageUrl = post.image;
  } else if (post.image?.url) {
    imageUrl = post.image.url;
  } else if (post.coverImage) {
    imageUrl = post.coverImage;
  } else if (post.imageUrl) {
    imageUrl = post.imageUrl;
  }

  // 4. Handle Featured status
  const featured = Boolean(post.featured) || post.featured === "true" || post.featured === 1;

  // 5. Handle Title & Excerpt fallbacks
  const safeTitle = post.title || "Untitled Perspective";
  const safeExcerpt = post.excerpt || (post.content ? post.content.substring(0, 160).replace(/<[^>]*>/g, '') + "..." : "Explore this insightful article from our compliance experts.");

  // 6. Handle Dates
  const dateObj = post.createdAt ? new Date(post.createdAt) : new Date();
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // 7. Calculate Read Time
  const readTime = post.readTime || Math.max(1, Math.ceil((post.content?.split(' ').length || 0) / 200)) || 5;

  // 8. Process content
  const rawContent = post.content || post.excerpt || "";
  const processedContent = renderContentWithImages(rawContent);

  return {
    ...post,
    id,
    slug,
    imageUrl,
    featured,
    safeTitle,
    safeExcerpt,
    formattedDate,
    readTime: `${readTime} min`,
    category: post.category || "General",
    tags: Array.isArray(post.tags) ? post.tags : [],
    content: processedContent
  };
};

/**
 * Fetches blogs and categories with in-memory caching.
 */
export const fetchBlogData = async (axios, apiBase, forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && blogCache.posts.length > 0 && blogCache.lastFetched && (now - blogCache.lastFetched < CACHE_TTL)) {
    return { posts: blogCache.posts, categories: blogCache.categories };
  }

  const t = new Date().getTime();
  const [blogsRes, catsRes] = await Promise.all([
    axios.get(`${apiBase}/blogs?t=${t}&limit=1000`, {
      headers: { "x-region": "in", "Cache-Control": "no-cache" },
    }),
    axios.get(`${apiBase}/categories?t=${t}`, {
      headers: { "Cache-Control": "no-cache" },
    }),
  ]);

  const blogArray = blogsRes.data.data || blogsRes.data || [];
  const catArray = catsRes.data.data || catsRes.data || [];

  const normalizedBlogs = blogArray.map((post, idx) => normalizeBlogData(post, idx));
  
  blogCache = {
    posts: normalizedBlogs,
    categories: catArray,
    lastFetched: now,
  };

  return { posts: blogCache.posts, categories: blogCache.categories };
};

/**
 * Logic for finding related posts.
 */
export const getRelatedPosts = (currentPost, allPosts, limit = 3) => {
  if (!currentPost || !allPosts) return [];

  return allPosts
    .filter(p => p.id !== currentPost.id) // Exclude current
    .map(p => {
      let score = 0;
      // Preference same category
      if (p.category === currentPost.category) score += 5;
      
      // Match tags
      const commonTags = p.tags.filter(tag => currentPost.tags.includes(tag));
      score += commonTags.length * 2;
      
      return { ...p, relevanceScore: score };
    })
    .filter(p => p.relevanceScore > 0) // Only if somewhat relevant
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Most relevant first
    .slice(0, limit);
};

/**
 * Debounce function for search
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

