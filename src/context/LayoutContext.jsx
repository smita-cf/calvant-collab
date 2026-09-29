"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const LayoutContext = createContext(null);

export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const SIDEBAR_EXPANDED_WIDTH = 280;
export const NAVBAR_HEIGHT = 64;

export const LayoutProvider = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Add this useEffect to sync on client
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarExpanded(false);
    };
    checkMobile(); // run immediately on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => !prev);
  }, []);

  const expandSidebar = useCallback(() => {
    setSidebarExpanded(true);
  }, []);

  const collapseSidebar = useCallback(() => {
    setSidebarExpanded(false);
  }, []);

  const setMobileView = useCallback((mobile) => {
    setIsMobile(mobile);
    if (mobile) {
      setSidebarExpanded(false);
    }
  }, []);

  const value = {
    sidebarExpanded,
    setSidebarExpanded,
    toggleSidebar,
    expandSidebar,
    collapseSidebar,
    isMobile,
    setMobileView,
    sidebarWidth: sidebarExpanded
      ? SIDEBAR_EXPANDED_WIDTH
      : SIDEBAR_COLLAPSED_WIDTH,
    navbarHeight: NAVBAR_HEIGHT,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

export default LayoutContext;
