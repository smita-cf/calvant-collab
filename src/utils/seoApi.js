const BASE_URL = process.env.NEXT_PUBLIC_CFTB || 'https://api.calvant.com';
const SEO_ENDPOINT = `${BASE_URL}/seo-form/api/seo`;

/**
 * Fetch all SEO configuration records.
 * @returns {Promise<Array>} List of SEO entries
 */
export const fetchSeoData = async () => {
    try {
        const response = await fetch(SEO_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`[SEO-API]: HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[SEO-API-ERROR]: Failed to fetch SEO data:', error.message);
        return []; // Fallback to empty list on error
    }
};

/**
 * Helper to strip any potential HTML tags from SEO metadata to prevent XSS.
 * Since we can't change the backend, we sanitize on the frontend.
 */
export const sanitizeMetaContent = (content) => {
    if (!content) return '';
    // Basic tag stripping if DOMPurify is not available
    return content.replace(/<[^>]*>?/gm, '').trim();
};