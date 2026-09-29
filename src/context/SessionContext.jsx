"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 5000;

const isJwtExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (err) {
    return true;
  }
};

const SessionContext = createContext(null);
export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking (guarantees SSR hydration match)

  // Check auth on mount
  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const user = sessionStorage.getItem("user") || localStorage.getItem("user") || localStorage.getItem("myObject");
    setIsAuthenticated(!!(token || user));
  }, []);

  // Re-check auth when sessionStorage changes (e.g. after login)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = sessionStorage.getItem("token");
      const user = sessionStorage.getItem("user");
      setIsAuthenticated(!!token && !!user);
    };
    window.addEventListener("storage", handleStorageChange);
    // Also poll briefly after mount to catch same-tab login
    const poll = setInterval(() => {
      const token = sessionStorage.getItem("token");
      const user = sessionStorage.getItem("user");
      const authed = !!token && !!user;
      setIsAuthenticated((prev) => (prev !== authed ? authed : prev));
    }, 500);
    // Stop polling after 10s (login should have happened by then)
    const stopPoll = setTimeout(() => clearInterval(poll), 10000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(poll);
      clearTimeout(stopPoll);
    };
  }, []);

  const idleTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const hadSessionRef = useRef(false);

  useEffect(() => {
    const resetTimer = () => (lastActivityRef.current = Date.now());
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    return () => events.forEach((e) => window.removeEventListener(e, resetTimer));
  }, []);

  useEffect(() => {
    idleTimerRef.current = setInterval(() => {
      const token = sessionStorage.getItem("token");
      const user = sessionStorage.getItem("user");
      if (hadSessionRef.current) {
        const idleTime = Date.now() - lastActivityRef.current;
        const expired = !token || !user || idleTime >= IDLE_TIMEOUT_MS || isJwtExpired(token);
        if (expired) {
          setSessionExpired(true);
          setIsAuthenticated(false);
          hadSessionRef.current = false;
        }
      } else if (token && user) {
        hadSessionRef.current = true;
        lastActivityRef.current = Date.now();
      }
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(idleTimerRef.current);
  }, []);

  const logout = async () => {
    const userObj = JSON.parse(sessionStorage.getItem("user") || "{}");
    const email = sessionStorage.getItem("email") || userObj.email || "unknown@example.com";
    const name = sessionStorage.getItem("uname") || userObj.name || email;
    const token = sessionStorage.getItem("token") || "";
    try {
      await fetch("https://api.calvant.com/logging-service/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, email, url: "/", action: "LOGOUT", item: null }),
        keepalive: true,
      });
    } catch (err) {
      console.warn("Logout log failed:", err);
    }
    sessionStorage.clear();
    setIsAuthenticated(false);   // ← update state immediately
    setSessionExpired(false);
    hadSessionRef.current = false;
    router.replace("/");          // ← redirect to landing page, not /login
  };

  const login = () => setIsAuthenticated(true);

  return (
    <SessionContext.Provider value={{ sessionExpired, logout, login, isAuthenticated }}>
      {children}
    </SessionContext.Provider>
  );
};