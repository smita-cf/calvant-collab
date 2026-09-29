'use client'

/**
 * adminAuth.js - safe for Next.js SSR
 * All sessionStorage calls are guarded with typeof window check
 */

const isBrowser = typeof window !== "undefined";

export const getAdminToken = () =>
  isBrowser ? sessionStorage.getItem("token") : null;

export const getAdminUser = () => {
  if (!isBrowser) return null;
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  return !!token;
};

export const isRootUser = () => {
  if (!isBrowser) return false;
  try {
    const user = getAdminUser();
    if (!user) return false;
    const role = Array.isArray(user.role) ? user.role[0] : user.role;
    return role === "root";
  } catch {
    return false;
  }
};

export const clearAdminSession = () => {
  if (isBrowser) sessionStorage.clear();
};
