"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fetchSeoData, sanitizeMetaContent } from '../utils/seoApi';
// Simple local matchPath replacement for Next.js compatibility
const matchPath = (currentPath, { path }) => {
    if (!path || !currentPath) return false;
    const pattern = path.replace(/:[^\s/]+/g, '([\\w-]+)');
    const regex = new RegExp(`^${pattern}$`, 'i');
    return regex.test(currentPath);
};

const SEOContext = createContext(null);

export const SEOProvider = ({ children }) => {
    const [seoEntries, setSeoEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastSyncAt, setLastSyncAt] = useState(null);

    /**
     * Fetch SEO data on mount.
     */
    const syncSeoData = useCallback(async () => {
        setLoading(true);
        const data = await fetchSeoData();
        setSeoEntries(data || []);
        setLastSyncAt(new Date());
        setLoading(false);
    }, []);

    useEffect(() => {
        syncSeoData();
        // Optional: Polling every 10 minutes for data freshness
        const interval = setInterval(syncSeoData, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [syncSeoData]);

    /**
     * Normalizes the route path (lower-case, remove trailing slash, etc.)
     */
    const normalizePath = (path) => {
        if (!path) return '/';
        let normalized = path.toLowerCase().trim();
        if (normalized !== '/' && normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        return normalized;
    };

    /**
     * The heart of the system: Dynamic pattern matching and JSON decoding.
     */
    const getSEOForPath = useCallback((currentPath) => {
        if (!seoEntries.length || !currentPath) return null;

        const normalizedCurrent = normalizePath(currentPath);

        // 1. First Pass: Static Exact Match (Optimized)
        let matched = seoEntries.find(entry => normalizePath(entry.url) === normalizedCurrent);

        // 2. Second Pass: Template/Regex Matching (for routes like /blog/:slug)
        if (!matched) {
            matched = seoEntries.find(entry => {
                const entryUrl = entry.url;
                if (entryUrl.includes(':')) { // Potential dynamic route
                    return !!matchPath(normalizedCurrent, {
                        path: entryUrl,
                    });
                }
                return false;
            });
        }

        if (!matched) return null;

        // 3. Decoding "The Metadata Bucket" (JSON in metaKeywords)
        let advanced = {};
        const keywordData = matched.metaKeywords || '';
        if (keywordData.includes(' | {')) {
            const [tagsOnly, jsonPart] = keywordData.split(' | ');
            try {
                advanced = JSON.parse(jsonPart);
                matched = { ...matched, metaKeywords: tagsOnly };
            } catch (e) {
                console.warn('[SEO-DECODE-ERROR]: Malformed JSON in metaKeywords');
            }
        }

        // 4. Sanitize and Enrichment
        return {
            title: sanitizeMetaContent(matched.pageTitle),
            description: sanitizeMetaContent(matched.metaDesc),
            keywords: sanitizeMetaContent(matched.metaKeywords),
            ogImage: advanced.og_img || null,
            canonical: advanced.canonical || currentPath,
            robots: advanced.robots || 'index, follow',
        };
    }, [seoEntries]);

    const contextValue = useMemo(() => ({
        getSEOForPath,
        loading,
        syncSeoData,
        lastSyncAt,
    }), [getSEOForPath, loading, syncSeoData, lastSyncAt]);

    return (
        <SEOContext.Provider value={contextValue}>
            {children}
        </SEOContext.Provider>
    );
};

export const useSEO = () => {
    const context = useContext(SEOContext);
    if (!context) {
        throw new Error('useSEO must be used within an SEOProvider');
    }
    return context;
};

