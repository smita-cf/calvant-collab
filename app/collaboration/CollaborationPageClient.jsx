"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Scale,
  Clock,
  Bell,
  Zap,
  FileSpreadsheet,
  Lock,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Send,
  ArrowRight,
  Layers,
} from "lucide-react";
import "./collaboration.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function CollaborationPageClient({ initialData }) {
  const pc = initialData || {};

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    organization: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.contactNumber ||
      !formData.organization
    ) {
      setStatusMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/collaboration/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: "Thank you! Your collaboration request has been submitted. Our team will contact you shortly.",
        });
        setFormData({
          name: "",
          email: "",
          contactNumber: "",
          organization: "",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.message || "Failed to submit request.",
        });
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setStatusMessage({
        type: "error",
        text: "Network error. Please try again or email us directly at sales@consultantsfactory.com.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fw-root" style={{ "--fw-accent": "#6366f1" }}>
      {/* ─── STANDARDIZED FRAMEWORK / DASHBOARD NAVBAR ─── */}
      <SiteHeader />

      {/* ─── MAIN 2-COLUMN SPLIT LAYOUT ─── */}
      <div className="collab-layout-wrapper">
        {/* ─── LEFT COLUMN: SCROLLABLE NARRATIVE CONTENT ─── */}
        <div className="collab-content-column">
          {/* Hero Narrative Block */}
          <div className="collab-hero-block">
            <div className="collab-badge">
              {(pc.heroBadge !== undefined ? pc.heroBadge : "🤝 CROSS-FUNCTIONAL COLLABORATION")}
            </div>

            <h1 className="collab-title">
              {(pc.heroTitle !== undefined ? pc.heroTitle : "Collaborating with Consultants Factory")}
            </h1>

            <p className="collab-lead">
              {(pc.heroDescription !== undefined ? pc.heroDescription : "CF helps you scale, win bigger mandates, and manage resource gaps. All while protecting your client relationships and enhancing your consulting capabilities. Let's explore how our consultants collaborations can drive shared success.")}
            </p>
          </div>

          {/* Section 1: Centralized Workspace */}
          <div className="collab-narrative-section">
            <span className="collab-section-tag">
              {(pc.overviewTag !== undefined ? pc.overviewTag : "01 · COLLABORATION BENEFITS")}
            </span>
            <h2>
              {(pc.overviewTitle !== undefined ? pc.overviewTitle : "Why Collaborate with Consultants Factory?")}
            </h2>
            <div className="collab-points-list">
              {(pc.pillars && pc.pillars.length > 0 ? pc.pillars : [
                { title: "Expand Without Hiring", description: "Access a ready pool of expert consultants without growing your internal headcount.", icon: "Users" },
                { title: "Bridge Resource Gaps", description: "Rely on us when facing tight client deadlines or limited availability.", icon: "Clock" },
                { title: "Tap into New Expertise", description: "Leverage niche skills and domain-specific knowledge across industries.", icon: "Zap" },
                { title: "Bid for Bigger Projects", description: "Collaborate on large-scale tenders and assignments with full confidence.", icon: "ShieldCheck" }
              ]).map((card, i) => {
                const IconComp =
                  {
                    Users: Users,
                    ShieldCheck: ShieldCheck,
                    Clock: Clock,
                    Zap: Zap,
                    Lock: Lock,
                    FileSpreadsheet: FileSpreadsheet,
                  }[card.icon] || Zap;
                return (
                  <div className="collab-point-item" key={i}>
                    {card.icon !== "None" && (
                      <div className="collab-point-icon">
                        <IconComp size={16} />
                      </div>
                    )}
                    <div className="collab-point-text">
                      <h4>{card.title}</h4>
                      <p>{card.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="collab-image-container" style={{ marginTop: "2rem" }}>
              {(pc.heroImageUrl !== undefined ? pc.heroImageUrl : "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop") ? (
                <img src={pc.heroImageUrl !== undefined ? pc.heroImageUrl : "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop"} alt="Collaboration Visual" style={{ width: "100%", borderRadius: "8px" }} />
              ) : null}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: ALWAYS VISIBLE STICKY FORM ─── */}
        <aside className="collab-sidebar-column">
          <div className="collab-sticky-form-box">
            <div className="collab-form-head">
              <div className="collab-form-badge">
                <span>🤝 Connect With Us</span>
              </div>
              <h3>{(pc.formTitle !== undefined ? pc.formTitle : "Interested in Collaborating?")}</h3>
            </div>

            {statusMessage && (
              <div
                className={`collab-alert ${statusMessage.type === "success" ? "collab-alert-success" : "collab-alert-error"}`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="collab-form">
              <div className="collab-input-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="collab-input-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="e.g. john@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="collab-input-group">
                <label htmlFor="contactNumber">Contact number *</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="collab-input-group">
                <label htmlFor="organization">Organization *</label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  required
                  placeholder="e.g. Acme Corp"
                  value={formData.organization}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="collab-submit-btn"
              >
                {submitting ? (
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <span>Submit</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* ── MATRIX SECTION ── */}
      <div className="collab-matrix-section">
        <h2>{(pc.matrixTitle !== undefined ? pc.matrixTitle : "Our Collaboration Matrix")}</h2>
        <div className="collab-matrix-table-wrapper">
          <table className="collab-matrix-table">
            <thead>
              <tr>
                <th></th>
                {(pc.matrixHeaders && pc.matrixHeaders.length > 0 ? pc.matrixHeaders : [
                  "References", "Co-Delivery", "Staff Augmentation", "Reverse Approach"
                ]).map((hdr, i) => (
                  <th key={i}>{hdr}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(pc.matrixRows && pc.matrixRows.length > 0 ? pc.matrixRows : [
                { rowLabel: "Summary", cells: ["You refer a client to us. We handle the sales, delivery, and billing directly with the client.", "We work together to win and deliver the project. Responsibilities are split based on our respective strengths.", "You own the client relationship and the project. We provide our consultants to work as part of your team.", "We own the project but lack specific expertise or capacity. We bring you in to deliver specific components."] },
                { rowLabel: "Suitable If", cells: ["You don't have the capability or desire to deliver the project yourself.", "The project requires combined expertise to win or deliver successfully.", "You want to scale up quickly for a specific project without hiring full-time staff.", "You have niche expertise or capacity that complements our core offerings."] },
                { rowLabel: "Client Contract", cells: ["Between Consultants Factory and the Client", "Joint contract or one party acts as prime contractor", "Between You and the Client", "Between Consultants Factory and the Client"] },
                { rowLabel: "Invoicing", cells: ["Consultants Factory invoices the Client.", "Prime contractor invoices Client; Sub invoices Prime.", "You invoice the Client. We invoice you.", "Consultants Factory invoices Client. You invoice us."] },
                { rowLabel: "Branding", cells: ["Consultants Factory", "Co-branded or Prime contractor branded", "Your Brand (White-labeled)", "Consultants Factory"] }
              ]).map((row, i) => {
                const headers = pc.matrixHeaders && pc.matrixHeaders.length > 0 ? pc.matrixHeaders : ["References", "Co-Delivery", "Staff Augmentation", "Reverse Approach"];
                return (
                  <tr key={i}>
                    <td className="collab-matrix-row-label" data-label="Category">{row.rowLabel}</td>
                    {(row.cells || []).map((cell, cIdx) => (
                      <td key={cIdx} data-label={headers[cIdx] || ""}>{cell}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FOOTER CTA SECTION ── */}
      <div className="collab-footer-section">
         <h2>{(pc.footerHeadline !== undefined ? pc.footerHeadline : "Let's grow together by building stronger networks.")}</h2>
         <p>{(pc.footerText1 !== undefined ? pc.footerText1 : "Partner with Consultants Factory to create meaningful opportunities, expand your capabilities, and deliver greater value to your clients.")}</p>
         <p>{(pc.footerText2 !== undefined ? pc.footerText2 : "Whether you're looking to collaborate, expand your service offerings, or build a long-term strategic partnership, let's explore how we can grow together.")}</p>
         <p>{(pc.footerText3 !== undefined ? pc.footerText3 : "Take the first step towards a more secure and compliant future.")}</p>
         <p className="collab-footer-contact">{(pc.footerContact !== undefined ? pc.footerContact : "Get in touch with us at +91 99450 77727 or email us at info@consultantsfactory.com")}</p>
      </div>

      {/* ─── STANDARDIZED FRAMEWORK / DASHBOARD FOOTER ─── */}
      <SiteFooter />
    </div>
  );
}
