// src/components/SiteFooter.jsx
"use client";
import Link from "next/link";
import "@/modules/dashboard/Dashboard.css";

/**
 * Standardized 5-column footer matching Frameworks & Dashboard
 */
export default function SiteFooter() {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer-content">
        <div className="dashboard-footer-section">
          <h4>CalVant</h4>
          <p>Enterprise Risk & Compliance Management Platform</p>
        </div>
        <div className="dashboard-footer-section">
          <h4>Product</h4>
          <ul>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/risk-assessment">Risk Management</Link></li>
            <li><Link href="/compliances">Compliance</Link></li>
            <li><Link href="/gap-assessment">Gap Assessment</Link></li>
          </ul>
        </div>
        <div className="dashboard-footer-section">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/collaboration">Collaboration</Link></li>
          </ul>
        </div>
        <div className="dashboard-footer-section">
          <h4>Legal</h4>
          <ul>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/security">Security</Link></li>
          </ul>
        </div>
        <div className="dashboard-footer-section">
          <h4>Resources</h4>
          <ul>
            <li><Link href="/blog">Blogs</Link></li>
            <li><Link href="/datasheet">Datasheet</Link></li>
          </ul>
        </div>
      </div>
      <div className="dashboard-footer-bottom">
        © {new Date().getFullYear()} CalVant. All rights reserved. Made in India
      </div>
    </footer>
  );
}
