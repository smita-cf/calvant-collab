import React, { useState, useEffect } from "react";
import Image from "next/image";
import trustCentreService from "../modules/trustcentre/service/TrustCentreService";

/**
 * DualLogo — shows "image.png  ×  OrgLogo"
 *
 * Props:
 *   calvantSrc   — path to your CalVant PNG   (default "/image.png")
 *   height       — CSS height string           (default "40px")
 *   className    — extra class on the wrapper
 *   style        — extra inline style on the wrapper
 *   dark         — true → uses white divider + text (for dark hero bg)
 */
const DualLogo = ({
  calvantSrc = "/image.png",
  height = "40px",
  className = "",
  style = {},
  dark = false,
}) => {
  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const org = user?.organization?._id || user?.organization;
  // const tcLogoUrl = org ? trustCentreService.getLogoUrl(org) : null;

  const tcLogoUrl = null;
  const [orgLogoSrc, setOrgLogoSrc] = useState(null); // null = probing
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (!tcLogoUrl) {
      setOrgLogoSrc(false);
      return;
    }
    const img = new Image();
    img.onload = () => setOrgLogoSrc(tcLogoUrl);
    img.onerror = () => setOrgLogoSrc(false); // false = failed
    img.src = tcLogoUrl;
  }, [tcLogoUrl]);

  // Grab org name from session for the text fallback
  useEffect(() => {
    const stored = user?.organization?.name || user?.organizationName || "";
    setOrgName(stored);
  }, []);

  const dividerColor = dark ? "rgba(255,255,255,0.35)" : "#e2e8f0";
  const xColor = dark ? "rgba(255,255,255,0.55)" : "#94a3b8";
  const textColor = dark ? "rgba(255,255,255,0.9)" : "#475569";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        ...style,
      }}
    >
      {/* ── CalVant logo ── */}
      <Image
        src={calvantSrc}
        alt="CalVant"
        width={120} // ← add this
        height={36}
        style={{
          height,
          width: "auto",
          objectFit: "contain",
          flexShrink: 0,
          transition: "transform 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />

      {/* Only render the × + org side if probe succeeded */}
      {orgLogoSrc !== false && orgLogoSrc !== null && (
        <>
          {/* Divider */}
          <div
            style={{
              width: 1,
              height: `calc(${height} * 0.7)`,
              background: dividerColor,
              flexShrink: 0,
            }}
          />

          {/* × symbol */}
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: xColor,
              flexShrink: 0,
              letterSpacing: "0.05em",
              userSelect: "none",
            }}
          >
            ×
          </span>

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: `calc(${height} * 0.7)`,
              background: dividerColor,
              flexShrink: 0,
            }}
          />

          {/* ── Org logo ── */}
          <Image
            src={orgLogoSrc}
            alt={orgName || "Organization"}
            style={{
              height,
              width: "auto",
              maxWidth: `calc(${height} * 3)`, // cap width so it doesn't stretch
              objectFit: "contain",
              flexShrink: 0,
              transition: "transform 0.3s",
              // Subtle rounded container feel
              borderRadius: 6,
              padding: "1px",
              background: dark ? "rgba(255,255,255,0.08)" : "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </>
      )}

      {/* If logo probe failed but we have a name → show text fallback with × */}
      {orgLogoSrc === false && orgName && (
        <>
          <div
            style={{
              width: 1,
              height: `calc(${height} * 0.7)`,
              background: dividerColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: xColor,
              flexShrink: 0,
            }}
          >
            ×
          </span>
          <div
            style={{
              width: 1,
              height: `calc(${height} * 0.7)`,
              background: dividerColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: textColor,
              whiteSpace: "nowrap",
            }}
          >
            {orgName}
          </span>
        </>
      )}
    </div>
  );
};

export default DualLogo;
