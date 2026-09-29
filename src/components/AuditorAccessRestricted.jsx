//C:\Users\ak192\Downloads\CalVant-Next-master (3)\CalVant-Next-master\src\components\AuditorAccessRestricted.jsx

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const AuditorAccessRestricted = () => {
  const router = useRouter();

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    } else if (router) {
      router.push("/");
    }
  };

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          maxWidth: "540px",
          width: "100%",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderRadius: "20px",
          padding: "40px 32px",
          textAlign: "center",
          boxShadow:
            "0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.6)",
        }}
      >
        {/* Icon Container */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(225, 29, 72, 0.15) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            marginBottom: "20px",
            color: "#ef4444",
            boxShadow: "0 8px 16px -4px rgba(239, 68, 68, 0.15)",
          }}
        >
          <ShieldAlert size={36} strokeWidth={2} />
        </div>

        {/* 404 Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "9999px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "16px",
            width: "fit-content",
            margin: "0 auto 16px auto",
          }}
        >
          <Lock size={12} /> 404 · Restricted Access
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 12px 0",
            lineHeight: "1.3",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Access Restricted
        </h2>

        {/* Main Required Notice Message */}
        <p
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#dc2626",
            margin: "0 0 12px 0",
            lineHeight: "1.5",
          }}
        >
          This module is not accessed by auditor or audit manager role.
        </p>

        {/* Sub-description */}
        <p
          style={{
            fontSize: "14px",
            color: "#64748b",
            margin: "0 0 28px 0",
            lineHeight: "1.6",
          }}
        >
          Your account permissions allow access only to the Home Dashboard, Task
          Management, Audit / Gap Assessment, and Compliance modules.
        </p>

        {/* Action Button */}
        <button
          onClick={handleGoHome}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "12px 24px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.35)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px 0 rgba(79, 70, 229, 0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 14px 0 rgba(79, 70, 229, 0.35)";
          }}
        >
          <ArrowLeft size={16} /> Back to Main Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default AuditorAccessRestricted;
