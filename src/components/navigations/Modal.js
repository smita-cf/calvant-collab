// C:\Users\ak192\Downloads\CalVant-Next-master (3)\CalVant-Next-master\src\components\navigations\Modal.js

import React from "react";
import { CheckCircle2, X } from "lucide-react";

const Modal = ({ isOpen, title, message, onClose, onConfirm, showCancel }) => {
  if (!isOpen) return null;

  // Attempt to guess if it's a success modal based on title (safely handle React elements)
  const isSuccess = typeof title === "string" && (title.toLowerCase().includes("success") || title.toLowerCase().includes("approved"));

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, color: "#000000",
        animation: "modalFadeIn 0.2s ease-out"
      }}
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      
      <div
        style={{
          background: "#ffffff", padding: "0", borderRadius: "16px",
          width: "460px", maxWidth: "90%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden", border: "1px solid #e2e8f0",
          fontFamily: "'Inter', 'DM Sans', sans-serif",
          animation: "modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div 
          style={{ 
            height: "4px", width: "100%", 
            background: isSuccess ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #3b82f6, #6366f1)" 
          }} 
        />
        
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
             {isSuccess && <CheckCircle2 size={20} color="#10b981" />}
             <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>{title}</h3>
           </div>
           <button 
             onClick={onClose} 
             style={{ 
               background: "transparent", border: "none", cursor: "pointer", 
               color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center",
               padding: "4px", borderRadius: "6px", transition: "all 0.15s"
             }}
             onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
             onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
           >
             <X size={18} />
           </button>
        </div>

        <div style={{ padding: "24px", fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>
          {message}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#ffffff" }}>
          {showCancel && (
            <button
              onClick={onClose}
              style={{
                padding: "8px 18px", borderRadius: "8px", border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff", color: "#475569", fontWeight: 600, fontSize: "13px",
                cursor: "pointer", transition: "all 0.15s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
            >
              Cancel
            </button>
          )}

          <button
            onClick={onConfirm || onClose}
            style={{
              padding: "8px 18px", borderRadius: "8px", border: "none",
              backgroundColor: isSuccess ? "#10b981" : "#2563eb", 
              color: "#ffffff", fontWeight: 600, fontSize: "13px",
              cursor: "pointer", boxShadow: isSuccess ? "0 2px 4px rgba(16, 185, 129, 0.2)" : "0 2px 4px rgba(37, 99, 235, 0.2)",
              transition: "all 0.15s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isSuccess ? "#059669" : "#1d4ed8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isSuccess ? "#10b981" : "#2563eb"; }}
          >
            {showCancel ? "Confirm" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
