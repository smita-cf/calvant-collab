/**
 * useActivityLogger.js - Auto-logs PAGE_LOAD on route changes, provides manual log helpers.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const lastLoggedPath = useRef(null);

  // ── Auto page-load log ─────────────────────────────────────────────────────
  useEffect(() => {
    const currentPath = pathname;
    if (lastLoggedPath.current === currentPath) return;
    lastLoggedPath.current = currentPath;

    captureActivity({
      action: ACTIONS.PAGE_LOAD,
      url: currentPath,
      item: null,
    });
  }, [pathname]);

  // ── Cleanup: beacon on tab close ────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        beaconActivity({
          action: ACTIONS.PAGE_LOAD,
          url: window.pathname,
          item: null,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return {
    logCreate, logUpdate, logDelete, logSelect, logClick, captureActivity,
    // logLogin, logLogout
  };
};

export default useActivityLogger;


