import React from "react";
import {
  Shield, Globe, Lock, Key, FileText, Settings, Rocket, Handshake,
  Scale, User, Users, Puzzle, CheckCircle, AlertTriangle, Database,
  Server, BarChart, TrendingUp, Award, Star, Zap,
} from "lucide-react";
import "./framework-page.css";

const ICON_MAP = {
  Shield, Globe, Lock, Key, FileText, Settings, Rocket, Handshake,
  Scale, User, Users, Puzzle, CheckCircle, AlertTriangle, Database,
  Server, BarChart, TrendingUp, Award, Star, Zap,
};
const DynamicIcon = ({ name, size = 24 }) => {
  const Icon = ICON_MAP[name] || Shield;
  return <Icon size={size} />;
};

// pc = pageContent, framework = { label, name, color, code, type }
const FrameworkPreviewRenderer = ({ pc, framework = {} }) => {
  if (!pc) return null;

  return (
    <div className="fw-root" style={{ "--fw-accent": framework.color || "#0066cc" }}>
      <section className="fw-hero">
        <div className="fw-hero-inner">
          <div className="fw-hero-content">
            {pc.heroBadgeText && <div className="fw-badge">{pc.heroBadgeText}</div>}
            <h2 className="fw-hero-title">
              {pc.heroTitle}{" "}
              {pc.heroTitleHighlight && <span className="fw-highlight">{pc.heroTitleHighlight}</span>}
            </h2>
            {pc.heroDescription && <p className="fw-hero-desc">{pc.heroDescription}</p>}
            <div className="fw-hero-cta">
              {pc.heroPrimaryCtaText && (
                <button className="fw-btn-primary" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                  {pc.heroPrimaryCtaText}
                </button>
              )}
              {pc.heroScrollTarget && <button className="fw-btn-secondary" disabled>Learn more</button>}
            </div>
            {pc.heroStats?.length > 0 && (
              <div className="fw-hero-stats">
                {pc.heroStats.map((stat, i) => (
                  <div key={i} className="fw-stat">
                    <span className="fw-stat-value">{stat.value}</span>
                    <span className="fw-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="fw-hero-visual">
            <div className="fw-orb" style={{
              background: `radial-gradient(circle at 30% 30%, ${framework.color || "#0066cc"}33, ${framework.color || "#0066cc"}08)`,
            }}>
              <div className="fw-orb-ring fw-orb-r1" />
              <div className="fw-orb-ring fw-orb-r2" />
              <div className="fw-orb-ring fw-orb-r3" />
              <div className="fw-orb-center">
                <div className="fw-orb-badge"><span>{framework.label || framework.code}</span></div>
                <p className="fw-orb-sub">{framework.sub || framework.type}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(pc.overviewTitle || pc.overviewCards?.length > 0) && (
        <section className="fw-section">
          <div className="fw-section-header">
            {pc.overviewTitle && <h2>{pc.overviewTitle}</h2>}
            {pc.overviewDescription && <p>{pc.overviewDescription}</p>}
          </div>
          {pc.overviewCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-3">
              {pc.overviewCards.map((card, i) => (
                <div key={i} className="fw-card">
                  <div className="fw-card-icon"><DynamicIcon name={card.icon} /></div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(pc.clausesTitle || pc.clauseCards?.length > 0) && (
        <section className="fw-section fw-section-alt">
          <div className="fw-section-header">
            {pc.clausesTitle && <h2>{pc.clausesTitle}</h2>}
            {pc.clausesDescription && <p>{pc.clausesDescription}</p>}
          </div>
          {pc.clauseCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-3">
              {pc.clauseCards.map((card, i) => (
                <div key={i} className="fw-clause-card">
                  {card.clauseLabel && <span className="fw-clause-label">{card.clauseLabel}</span>}
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  {card.bulletPoints?.length > 0 && <ul>{card.bulletPoints.map((bp, j) => <li key={j}>{bp}</li>)}</ul>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(pc.controlsTitle || pc.domainCards?.length > 0) && (
        <section className="fw-section">
          <div className="fw-section-header">
            {pc.controlsTitle && <h2>{pc.controlsTitle}</h2>}
            {pc.controlsDescription && <p>{pc.controlsDescription}</p>}
          </div>
          {pc.domainCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-auto">
              {pc.domainCards.map((card, i) => (
                <div key={i} className="fw-domain-card">
                  <h4>{card.domainTitle}</h4>
                  <p>{card.domainDescription}</p>
                  {card.controls?.length > 0 && <ul>{card.controls.map((c, j) => <li key={j}>{c}</li>)}</ul>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(pc.benefitsTitle || pc.benefitCards?.length > 0) && (
        <section className="fw-section fw-section-alt">
          <div className="fw-section-header">
            {pc.benefitsTitle && <h2>{pc.benefitsTitle}</h2>}
            {pc.benefitsDescription && <p>{pc.benefitsDescription}</p>}
          </div>
          {pc.benefitCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-3">
              {pc.benefitCards.map((card, i) => (
                <div key={i} className="fw-benefit-card">
                  <div className="fw-benefit-icon"><DynamicIcon name={card.icon} /></div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(pc.stepsTitle || pc.stepCards?.length > 0) && (
        <section className="fw-section">
          <div className="fw-section-header">
            {pc.stepsTitle && <h2>{pc.stepsTitle}</h2>}
            {pc.stepsDescription && <p>{pc.stepsDescription}</p>}
          </div>
          {pc.stepCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-3">
              {pc.stepCards.map((card, i) => (
                <div key={i} className="fw-step-card">
                  <div className="fw-step-num">{card.stepNumber}</div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  {card.bulletPoints?.length > 0 && <ul>{card.bulletPoints.map((bp, j) => <li key={j}>{bp}</li>)}</ul>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(pc.ctaTitle || pc.ctaDescription) && (
        <section className="fw-section">
          <div className="fw-cta-box">
            {pc.ctaTitle && <h2>{pc.ctaTitle}</h2>}
            {pc.ctaDescription && <p>{pc.ctaDescription}</p>}
            <div className="fw-cta-btns">
              <button className="fw-btn-primary" disabled>Get a demo</button>
              <button className="fw-btn-secondary" disabled>Talk to an expert</button>
            </div>
          </div>
        </section>
      )}

      <footer className="fw-footer">
        <div className="fw-footer-inner">
          <div>
            <h4>CalVant</h4>
            <p>{pc.footerTagline || `One platform to operationalize ${framework.name || ""}`}</p>
          </div>
        </div>
        <div className="fw-footer-bottom">{framework.label || framework.name} · Made in India</div>
      </footer>
    </div>
  );
};

export default FrameworkPreviewRenderer;