// src/hooks/useTrustCentreLogo.js
import { useState, useEffect } from "react";
import trustCentreService from "../modules/trustcentre/service/TrustCentreService";
/**
 * Returns the org's Trust Centre logo URL if it loads successfully,
 * otherwise returns the fallback ("/image.png" by default).
 */
const useTrustCentreLogo = (fallback = "/image.png") => {
  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null"); }
    catch { return null; }
  })();

  const org = user?.organization?._id || user?.organization;
  const logoUrl = org ? trustCentreService.getLogoUrl(org) : null;

  const [src, setSrc] = useState(logoUrl || fallback);

  useEffect(() => {
    if (!logoUrl) { setSrc(fallback); return; }

    // Probe the logo URL with a HEAD/GET — if it 404s or errors, use fallback
    const img = new Image();
    img.onload  = () => setSrc(logoUrl);
    img.onerror = () => setSrc(fallback);
    img.src = logoUrl;
  }, [logoUrl, fallback]);

  return src;
};

export default useTrustCentreLogo;