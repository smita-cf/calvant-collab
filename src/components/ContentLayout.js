import Link from 'next/link';
import React from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "../styles/ProfessionalLayout.css";

const ContentLayout = ({ children, narrow = false, heroSection = null }) => {
  return (
    <div className="professional-layout">
      <SiteHeader />
      
      {heroSection && (
        <section className="professional-hero">
          <div className={`professional-container ${narrow ? 'narrow' : ''}`}>
            {heroSection}
          </div>
        </section>
      )}

      <main className="professional-section">
        <div className={`professional-container ${narrow ? 'narrow' : ''}`}>
          <div className="professional-content">
            {children}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default ContentLayout;
