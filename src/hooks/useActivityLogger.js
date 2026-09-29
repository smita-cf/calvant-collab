/**
 * useActivityLogger.js
 *
 * React hook that:
 *  1. Fires a PAGE_LOAD log every time the route changes (item: null).
 *  2. Exposes helper functions for manual action logging.
 *
 * Rules:
 *  - Uses a ref to track the last-logged path to avoid double-logging
 *    the same route (e.g. React Strict Mode double-mount).
 *  - Never rethrows — logging failures are silent.
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  captureActivity,
  beaconActivity,
  logCreate,
  logUpdate,
  logDelete,
  logSelect,
  logClick,
  ACTIONS,
} from "../services/activities";

const useActivityLogger = () => {
  const location = useLocation();
  const lastLoggedPath = useRef(null);   // dedup guard across re-renders

  // ── Auto page-load log ─────────────────────────────────────────────────────
  useEffect(() => {
    const currentPath = location.pathname;

    // Skip if we already logged this exact path (double-mount / StrictMode)
    if (lastLoggedPath.current === currentPath) return;
    lastLoggedPath.current = currentPath;

    captureActivity({
      action: ACTIONS.PAGE_LOAD,
      url:    currentPath,
      item:   null,          // nothing was clicked — just a page load
    });
  }, [location.pathname]);

  // ── Cleanup: beacon on tab close / page hidden ────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        beaconActivity({
          action: ACTIONS.PAGE_LOAD,
          url:    window.location.pathname,
          item:   null,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);   // only once — no dependencies

  // ── Expose manual loggers to consuming components ─────────────────────────
  return {
    logCreate,
    logUpdate,
    logDelete,
    logSelect,
    logClick,
    captureActivity,
  };
};

export default useActivityLogger;
