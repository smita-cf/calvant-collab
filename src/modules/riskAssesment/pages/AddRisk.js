import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MultiStepFormManager from "../components/forms/MultiStepFormManager";
import { captureActivity, ACTIONS, MODULES } from "../../admin/shell/services/activities";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";

const addRiskStyles = `
  .addrisk-page {
    position: relative;
    padding: 24px 32px 0 32px;
    max-width: 1120px;
    margin: 0 auto;
  }

  .addrisk-back-btn {
    position: absolute;
    top: 32px;
    left: 32px;
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    color: #ffffff;
    background: #3b82f6;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 999;
  }

  .addrisk-back-btn:hover {
    background: #2563eb;
    color: #ffffff;
  }

  .addrisk-back-btn--hidden {
    transform: translateY(-100%);
    opacity: 0;
  }

  .addrisk-back-btn--visible {
    transform: translateY(0);
    opacity: 1;
    zIndex:0;
  }

  /* Small phones */
  @media (max-width: 480px) {
    .addrisk-page {
      padding: 16px 12px 0 12px;
    }

    .addrisk-back-btn {
      width: 100%;
      margin-bottom: 12px;
      font-size: 13px;
      padding: 10px 16px;
    }
  }

  /* Tablets */
  @media (min-width: 481px) and (max-width: 768px) {
    .addrisk-page {
      padding: 20px 20px 0 20px;
    }
  }

  /* Large desktop */
  @media (min-width: 1200px) {
    .addrisk-page {
      max-width: 1280px;
    }
  }
`;

const AddRisk = () => {
  const router = useRouter();
  const pathname = usePathname();
  const focusArea = "risk";

  // ── User session ──────────────────────────────────────────────────────────
  // effectiveOrgId is only non-null once the full session is resolved,
  // making it a reliable signal — same pattern used by AuditDashboard.
  const { effectiveOrgId } = useEffectiveOrg();

  const [showButtons, setShowButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ── Scroll hide/show ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowButtons(false);
      } else {
        setShowButtons(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // ── LOG: page load ────────────────────────────────────────────────────────
  // effectiveOrgId is derived from JWT and is only non-null once the full
  // session resolution is complete — prevents stale user data being logged.
  useEffect(() => {
    if (!effectiveOrgId) return;
    captureActivity({
      action: ACTIONS.VISITED,
      module: MODULES.RISK,
      url: "/risk-assessment/add",
    });
  }, [effectiveOrgId]);
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    // submission happens inside MultiStepFormManager
  };

  return (
    <div className="addrisk-page">
      <style>{addRiskStyles}</style>

      <button
        className={`addrisk-back-btn ${
          showButtons ? "addrisk-back-btn--visible" : "addrisk-back-btn--hidden"
        }`}
        onClick={() => {
          captureActivity({
            action: ACTIONS.CLICK,
            module: MODULES.RISK,
            item: "Back to Dashboard",
            url: "/risk-assessment/add",
          });
          router.push("/risk-assessment");
        }}
      >
        ← Back
      </button>

      <MultiStepFormManager onSubmit={handleSubmit} focusArea={focusArea} />
    </div>
  );
};

export default AddRisk;