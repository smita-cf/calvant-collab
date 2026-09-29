import { jwtDecode } from "jwt-decode";

// Helper utility for managing authentication state and token expiration

/**
 * Checks if the current token stored in localStorage has expired.
 * @returns {boolean} True if the token is expired, missing, or invalid, false otherwise.
 */
export const isTokenExpired = () => {
  const token = localStorage.getItem("token");

  // If there's no token, consider it expired to force re-login
  if (!token) {
    return true;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if the token's expiration time has passed
    if (decoded.exp < currentTime) {
      return true;
    }

    return false;
  } catch (error) {
    // If the token is invalid or cannot be decoded, treat as expired
    return true;
  }
};

/**
 * Clears all authentication data from storage and redirects to the sign-in page.
 * @param {boolean} isManualLogout - If true, redirects without the expired flag.
 */
export const clearAuthAndRedirect = (isManualLogout = false) => {
  // Clear all local and session storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Only redirect if not already on the signin page to prevent redirect loops
  if (window.location.pathname !== "/signin") {
    window.location.href = isManualLogout ? "/signin" : "/signin?expired=true";
  }
};
