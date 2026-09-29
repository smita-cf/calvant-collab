import React, { useRef, useEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  ShieldCheck,
  FileText,
  SearchCheck,
  CheckCircle2,
  Users,
  Server,
  MonitorSmartphone,
  Lock,
} from "lucide-react";

gsap.registerPlugin(MotionPathPlugin);

// ---------- SHARED CONFIG ----------

const ENTITIES = [
  { id: "risk",  label: "Risk",        color: "#f97316" },
  { id: "docs",  label: "Policy",      color: "#2563eb" },
  { id: "gap",   label: "Audit",       color: "#eab308" },
  { id: "task",  label: "Task",        color: "#800080" },
  { id: "tprm",  label: "TPRM Centre", color: "#e11d48" },
];

const TSCS = [
  { id: "iso_27001", label: "ISO 27001" },
  { id: "iso_27701", label: "ISO 27701" },
  { id: "iso_42001", label: "ISO 42001" },
  { id: "soc_2",     label: "SOC 2"     },
  { id: "ksa_pdpl",  label: "KSA PDPL"  },
];

const COLORS = {
  bg:             "#f9fafb",
  cardBg:         "#ffffff",
  borderSoft:     "rgba(148,163,184,0.35)",
  textMuted:      "#6b7280",
  heading:        "#111827",
  accentBlue:     "#2563eb",
  accentBlueSoft: "#60a5fa",
  accentGreen:    "#16a34a",
  path:           "rgba(148,163,184,0.55)",
  pathActive:     "#2563eb",
};

const CARD_H   = 56;
const CARD_GAP = 12;
const COL_TOP  = 32;   // label row height

// Bezier path: from (x1,y1) → (x2,y2) with horizontal control points
const makePath = (x1, y1, x2, y2) => {
  const cp1x = x1 + (x2 - x1) * 0.5;
  const cp2x = x1 + (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${cp1x} ${y1} ${cp2x} ${y2} ${x2} ${y2}`;
};

// ========== DESKTOP ROOT ==========

const SprintoConnectionsDesktop = ({ onConnectionClick }) => {
  const [entityProgress, setEntityProgress] = useState(
    ENTITIES.reduce((a, e) => ({ ...a, [e.id]: 10 }), {})
  );
  const [entityComplete, setEntityComplete] = useState(
    ENTITIES.reduce((a, e) => ({ ...a, [e.id]: false }), {})
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline({
      repeat: -1,
      onRepeat: () => {
        setEntityProgress(ENTITIES.reduce((a, e) => ({ ...a, [e.id]: 10 }), {}));
        setEntityComplete(ENTITIES.reduce((a, e) => ({ ...a, [e.id]: false }), {}));
        setActiveIndex(0);
      },
    });
    ENTITIES.forEach((entity, index) => {
      const obj = { value: 10 };
      tl.to(obj, {
        value: 100, duration: 2.5, ease: "power1.inOut",
        onStart:    () => setActiveIndex(index),
        onUpdate:   () => setEntityProgress(p => ({ ...p, [entity.id]: obj.value })),
        onComplete: () => setEntityComplete(p => ({ ...p, [entity.id]: true })),
      });
    });
    return () => tl.kill();
  }, []);

  const allComplete = ENTITIES.every(e => entityComplete[e.id]);

  return (
    <div style={{
      borderRadius: 28, background: COLORS.bg,
      padding: "28px 32px",
      border: `1px solid ${COLORS.borderSoft}`,
      boxShadow: "0 24px 90px rgba(15,23,42,0.14)",
      maxWidth: 1100,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "linear-gradient(135deg,rgba(79,70,229,0.1),rgba(59,130,246,0.2))",
          border: `1px solid ${COLORS.borderSoft}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: COLORS.accentBlue,
        }}>CV</div>
        <div>
          <div style={{ fontWeight: 600, color: COLORS.heading, fontSize: 20 }}>CalVant</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>Modules mapped to compliance frameworks</div>
        </div>
      </div>

      <MainGrid
        onConnectionClick={onConnectionClick}
        entityProgress={entityProgress}
        entityComplete={entityComplete}
        activeIndex={activeIndex}
        allComplete={allComplete}
      />
    </div>
  );
};

// ========== MAIN GRID ==========

const MainGrid = ({ onConnectionClick, entityProgress, entityComplete, activeIndex, allComplete }) => {
  const [hoverId, setHoverId] = useState(null);

  const totalLeftH  = ENTITIES.length * CARD_H + (ENTITIES.length - 1) * CARD_GAP;
  const totalRightH = TSCS.length    * CARD_H + (TSCS.length    - 1) * CARD_GAP;
  const rightPushDown = Math.max(0, (totalLeftH - totalRightH) / 2);

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px 1fr",
        columnGap: 0,
      }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <ColLabel>VERTICALS</ColLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: CARD_GAP }}>
            {ENTITIES.map((e, i) => (
              <HoverScale key={e.id} active={hoverId === `L-${e.id}` || activeIndex === i}>
                <EntityCard entity={e} value={entityProgress[e.id] || 0} complete={entityComplete[e.id]} />
              </HoverScale>
            ))}
          </div>
        </div>

        {/* CENTER HUB */}
        <CenterHub activeIndex={activeIndex} allComplete={allComplete} active={Boolean(hoverId)} />

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <ColLabel>FRAMEWORKS</ColLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: CARD_GAP, marginTop: rightPushDown }}>
            {TSCS.map((t) => (
              <HoverScale key={t.id} active={hoverId === `R-${t.id}`}>
                <TscCard label={t.label} />
              </HoverScale>
            ))}
          </div>
        </div>
      </div>

      {/* SVG overlay for connections */}
      <ConnectionsOverlay
        hoverId={hoverId}
        setHoverId={setHoverId}
        onConnectionClick={onConnectionClick}
      />
    </div>
  );
};

// ========== HELPERS ==========

const ColLabel = ({ children }) => (
  <div style={{
    height: COL_TOP, display: "flex", alignItems: "center",
    fontSize: 11, textTransform: "uppercase", letterSpacing: 2,
    color: COLORS.textMuted, marginBottom: 0,
  }}>{children}</div>
);

const HoverScale = ({ active, children }) => (
  <div style={{
    transform: active ? "translateY(-2px) scale(1.015)" : "translateY(0) scale(1)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    boxShadow: active ? "0 12px 28px rgba(15,23,42,0.13)" : "none",
    borderRadius: 14,
  }}>{children}</div>
);

const CardShell = ({ children }) => (
  <div style={{
    background: COLORS.cardBg, borderRadius: 14,
    padding: "0 16px", height: CARD_H,
    display: "flex", alignItems: "center",
    boxShadow: "0 2px 18px rgba(15,23,42,0.08)",
    border: "1px solid rgba(226,232,240,1)",
    boxSizing: "border-box",
  }}>{children}</div>
);

const EntityCard = ({ entity, value, complete }) => (
  <CardShell>
    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: entity.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: 18,
      }}>●</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.heading, whiteSpace: "nowrap" }}>
          {entity.label}
        </div>
        <ProgressBar value={value} />
      </div>
    </div>
    <StatusBadge complete={complete} />
  </CardShell>
);

const TscCard = ({ label }) => (
  <CardShell>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, color: COLORS.accentGreen,
      }}>✓</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.heading }}>{label}</div>
    </div>
  </CardShell>
);

const ProgressBar = ({ value }) => (
  <div style={{
    marginTop: 5, height: 4, width: "100%", maxWidth: 90,
    borderRadius: 999, background: "#e5e7eb", overflow: "hidden",
  }}>
    <div style={{
      height: "100%",
      width: `${Math.min(100, Math.max(0, value))}%`,
      background: `linear-gradient(90deg,${COLORS.accentBlueSoft},${COLORS.accentBlue})`,
      transition: "width 0.1s linear",
    }} />
  </div>
);

const StatusBadge = ({ complete }) => (
  <div style={{
    width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginLeft: 8,
    border: complete ? `2px solid ${COLORS.accentGreen}` : "2px solid rgba(148,163,184,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, color: complete ? COLORS.accentGreen : COLORS.textMuted,
  }}>{complete ? "✓" : ""}</div>
);

// ========== CENTER HUB ==========

const CenterHub = ({ activeIndex, allComplete, active }) => {
  const messages = [
    "Running Risk Management checks...",
    "Processing Policy evidence...",
    "Evaluating Audit gaps...",
    "Processing Task Management...",
    "Reviewing TPRM Centre...",
    "All modules complete. Compliance achieved.",
  ];
  const icons = [ShieldCheck, FileText, SearchCheck, CheckCircle2, Users, CheckCircle2];
  const idx  = allComplete ? 5 : Math.min(activeIndex, 4);
  const Icon = icons[idx];
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { scale: 0.95, opacity: 0.7 },
      { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
    );
  }, [idx]);

  const totalCardH = ENTITIES.length * CARD_H + (ENTITIES.length - 1) * CARD_GAP;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      paddingTop: COL_TOP,
      height: COL_TOP + totalCardH,
    }}>
      <div style={{
        width: 175, height: 175, borderRadius: 22,
        background: "linear-gradient(160deg,#2563eb,#22c55e)",
        padding: 10,
        boxShadow: "0 20px 55px rgba(37,99,235,0.38)",
        transform: active ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.2s ease",
        flexShrink: 0,
      }}>
        <div ref={cardRef} style={{
          width: "100%", height: "100%", borderRadius: 14,
          background: COLORS.cardBg,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: 10, textAlign: "center",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: COLORS.accentBlue, marginBottom: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", boxShadow: "0 12px 36px rgba(37,99,235,0.55)",
          }}>
            <Icon size={28} strokeWidth={2.3} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.heading, marginBottom: 3 }}>CalVant</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45 }}>
            {messages[idx]}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== SVG CONNECTIONS ==========

const ConnectionsOverlay = ({ hoverId, setHoverId, onConnectionClick }) => {
  const containerRef = useRef(null);
  const [dims, setDims]   = useState({ w: 0, h: 0 });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { connections, cx, cy } = useMemo(() => {
    const { w } = dims;
    if (!w) return { connections: [], cx: 0, cy: 0 };

    // Grid: 1fr | 200px | 1fr  → side col = (w - 200) / 2
    const centerColW = 200;
    const sideColW   = (w - centerColW) / 2;

    const leftEdgeX  = sideColW;          // right edge of left cards
    const rightEdgeX = sideColW + centerColW; // left edge of right cards
    const centerX    = w / 2;

    // Left card Ys (5 cards, starting after label row)
    const leftYs = ENTITIES.map((_, i) => COL_TOP + i * (CARD_H + CARD_GAP) + CARD_H / 2);

    // Center Y = middle of left stack
    const totalLeft = ENTITIES.length * CARD_H + (ENTITIES.length - 1) * CARD_GAP;
    const centerY   = COL_TOP + totalLeft / 2;

    // Right card Ys (5 cards centered around centerY)
    const totalRight = TSCS.length * CARD_H + (TSCS.length - 1) * CARD_GAP;
    const rightTop   = centerY - totalRight / 2;
    const rightYs    = TSCS.map((_, i) => rightTop + i * (CARD_H + CARD_GAP) + CARD_H / 2);

    const leftConns = ENTITIES.map((e, i) => ({
      id:    `L-${e.id}`,
      d:     makePath(leftEdgeX, leftYs[i], centerX, centerY),
      from:  { x: leftEdgeX, y: leftYs[i] },
      to:    { x: centerX,   y: centerY   },
      label: `${e.label} → Hub`,
    }));

    const rightConns = TSCS.map((t, i) => ({
      id:    `R-${t.id}`,
      d:     makePath(centerX, centerY, rightEdgeX, rightYs[i]),
      from:  { x: centerX,    y: centerY    },
      to:    { x: rightEdgeX, y: rightYs[i] },
      label: `Hub → ${t.label}`,
    }));

    return { connections: [...leftConns, ...rightConns], cx: centerX, cy: centerY };
  }, [dims]);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {dims.w > 0 && (
        <svg width={dims.w} height={dims.h}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <marker id="arr-normal" markerWidth="7" markerHeight="7"
              refX="5.5" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0,1 L0,6 L7,3.5 z" fill="rgba(148,163,184,0.75)" />
            </marker>
            <marker id="arr-active" markerWidth="7" markerHeight="7"
              refX="5.5" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0,1 L0,6 L7,3.5 z" fill={COLORS.accentBlue} />
            </marker>
            <filter id="glow-dot">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {connections.map((conn, idx) => (
            <ConnLine
              key={conn.id}
              conn={conn}
              hovered={hoverId === conn.id}
              delay={idx * 0.45}
              onEnter={(id, label, pos) => { setHoverId(id); setTooltip({ label, x: pos.x, y: pos.y }); }}
              onLeave={() => { setHoverId(null); setTooltip(null); }}
              onClick={onConnectionClick}
            />
          ))}

          {/* Hub pulse dot */}
          <circle cx={cx} cy={cy} r={4} fill={COLORS.accentBlue} opacity={0.18} />
        </svg>
      )}

      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y,
          transform: "translate(-50%, -140%)",
          background: "white", borderRadius: 999,
          padding: "3px 10px", fontSize: 11, color: COLORS.heading,
          boxShadow: "0 4px 16px rgba(15,23,42,0.18)",
          pointerEvents: "none", whiteSpace: "nowrap",
          border: `1px solid ${COLORS.borderSoft}`,
        }}>{tooltip.label}</div>
      )}
    </div>
  );
};

// ========== SINGLE LINE ==========

const ConnLine = ({ conn, hovered, delay, onEnter, onLeave, onClick }) => {
  const pathRef = useRef(null);
  const dotRef  = useRef(null);
  const tlRef   = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const dot  = dotRef.current;
    if (!path || !dot) return;
    tlRef.current?.kill();
    const tl = gsap.timeline({ repeat: -1, delay: delay ?? 0 });
    tl.to(dot, {
      duration: 3.2, ease: "none",
      motionPath: { path, align: path, autoRotate: false, alignOrigin: [0.5, 0.5] },
    });
    tlRef.current = tl;
    return () => tl.kill();
  }, [conn.d, delay]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    gsap.to(path, {
      stroke: hovered ? COLORS.pathActive : COLORS.path,
      strokeWidth: hovered ? 2.2 : 1.4,
      duration: 0.22,
    });
    if (tlRef.current) tlRef.current.timeScale(hovered ? 2.5 : 1);
  }, [hovered]);

  const mid = { x: (conn.from.x + conn.to.x) / 2, y: (conn.from.y + conn.to.y) / 2 };

  return (
    <g style={{ pointerEvents: "auto", cursor: "pointer" }}
      onMouseEnter={() => onEnter(conn.id, conn.label, mid)}
      onMouseLeave={() => onLeave(conn.id)}
      onClick={() => onClick && onClick(conn.id)}
    >
      {/* Fat transparent hit area */}
      <path d={conn.d} fill="none" stroke="transparent" strokeWidth={22} />

      {/* Visible path with arrowhead */}
      <path
        ref={pathRef}
        d={conn.d}
        fill="none"
        stroke={COLORS.path}
        strokeWidth={1.4}
        strokeLinecap="round"
        markerEnd={hovered ? "url(#arr-active)" : "url(#arr-normal)"}
      />

      {/* Endpoint anchors */}
      <circle cx={conn.from.x} cy={conn.from.y} r={3}
        fill={hovered ? COLORS.accentBlue : "#cbd5e1"} />
      <circle cx={conn.to.x} cy={conn.to.y} r={3}
        fill={hovered ? COLORS.accentBlue : "#cbd5e1"} />

      {/* Traveling dot */}
      <circle ref={dotRef} r={4.5}
        fill={COLORS.accentBlue} stroke="#bfdbfe" strokeWidth={1.5}
        filter="url(#glow-dot)" />
    </g>
  );
};

// ========== MOBILE ==========

const MOBILE_COLORS = {
  bg: "#f9fafb", cardBg: "#ffffff", panelBg: "#ffffff",
  chipBg: "rgba(226,232,240,0.9)", borderSoft: "rgba(148,163,184,0.35)",
  textMuted: "#6b7280", textBright: "#111827", heading: "#111827",
  accentBlue: "#2563eb", accentBlueSoft: "#60a5fa", accentGreen: "#16a34a",
};

const MOBILE_ENTITIES = [
  { id: "risk",  label: "Risk Management", icon: Users           },
  { id: "docs",  label: "Documentation",   icon: MonitorSmartphone },
  { id: "gap",   label: "Gap Assessment",  icon: Server          },
  { id: "task",  label: "Task Management", icon: Server          },
  { id: "tprm",  label: "TPRM Centre",     icon: ShieldCheck     },
];

const MOBILE_TSCS = [
  { id: "iso_27001", label: "ISO 27001", icon: FileText    },
  { id: "iso_27701", label: "ISO 27701", icon: Lock        },
  { id: "iso_42001", label: "ISO 42001", icon: Server      },
  { id: "soc_2",     label: "SOC 2",     icon: Server      },
  { id: "ksa_pdpl",  label: "KSA PDPL",  icon: ShieldCheck },
];

const STATUS_MESSAGES = [
  "Linking People, Assets, Infra, Apps and Process…",
  "Evaluating security controls across all entities…",
  "Mapping controls to compliance frameworks…",
  "All checks complete. Controls fully aligned.",
];

const SprintoConnectionsMobile = () => {
  const [step, setStep]               = useState(0);
  const [activeEntity, setActiveEntity] = useState(0);
  const [activeTsc, setActiveTsc]     = useState(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });
    MOBILE_ENTITIES.forEach((_, i) => {
      tl.to({}, { duration: 1.8, onStart: () => {
        setStep(Math.min(i, 2));
        setActiveEntity(i);
        setActiveTsc(null);
      }});
    });
    MOBILE_TSCS.forEach((_, i) => {
      tl.to({}, { duration: 1.4, onStart: () => {
        setStep(3);
        setActiveEntity(MOBILE_ENTITIES.length - 1);
        setActiveTsc(i);
      }});
    });
    tl.to({}, { duration: 2.5 });
    return () => tl.kill();
  }, []);

  useEffect(() => {
    if (!statusRef.current) return;
    gsap.fromTo(statusRef.current, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.3 });
  }, [step]);

  const StatusIcon = [ShieldCheck, FileText, SearchCheck, CheckCircle2][step];

  return (
    <div style={{
      borderRadius: 16, background: MOBILE_COLORS.bg, padding: 12,
      border: `1px solid ${MOBILE_COLORS.borderSoft}`,
      boxShadow: "0 22px 70px rgba(15,23,42,0.14)",
      maxWidth: "100%", color: MOBILE_COLORS.textBright,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg,rgba(96,165,250,0.15),rgba(56,189,248,0.32))",
            border: `1px solid ${MOBILE_COLORS.borderSoft}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: MOBILE_COLORS.accentBlue,
          }}>CV</div>
          <div>
            <div style={{ fontWeight: 600, color: MOBILE_COLORS.heading, fontSize: 16 }}>CalVant</div>
            <div style={{ fontSize: 11, color: MOBILE_COLORS.textMuted }}>Compliance platform</div>
          </div>
        </div>
        <div style={{
          padding: "3px 9px", borderRadius: 999, fontSize: 10,
          border: `1px solid ${MOBILE_COLORS.borderSoft}`,
          display: "flex", alignItems: "center", gap: 5, color: MOBILE_COLORS.textMuted,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%",
            background: MOBILE_COLORS.accentGreen, boxShadow: "0 0 10px rgba(34,197,94,0.8)" }} />
          Live
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Entities panel */}
        <div style={{
          padding: 10, borderRadius: 14, background: MOBILE_COLORS.panelBg,
          border: `1px solid ${MOBILE_COLORS.borderSoft}`,
          boxShadow: "0 2px 14px rgba(15,23,42,0.06)",
        }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.6,
            color: MOBILE_COLORS.textMuted, marginBottom: 8 }}>Verticals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MOBILE_ENTITIES.map((e, i) => {
              const Icon = e.icon; const active = i === activeEntity;
              return (
                <div key={e.id} style={{
                  padding: "7px 10px", borderRadius: 10,
                  border: `1px solid ${active ? MOBILE_COLORS.accentBlueSoft : MOBILE_COLORS.borderSoft}`,
                  background: MOBILE_COLORS.chipBg,
                  display: "flex", alignItems: "center", gap: 8,
                  transform: active ? "scale(1.015)" : "scale(1)",
                  transition: "transform 0.18s, border-color 0.18s",
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(30,64,175,0.85)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={12} color="#e5e7eb" />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{e.label}</div>
                  <div style={{ marginLeft: "auto", width: 14, height: 14, borderRadius: "50%",
                    border: `1.5px solid ${active ? MOBILE_COLORS.accentGreen : MOBILE_COLORS.borderSoft}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: active ? MOBILE_COLORS.accentGreen : "transparent" }}>
                    {active ? "✓" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center engine */}
        <div style={{
          borderRadius: 18, padding: 2,
          background: "linear-gradient(150deg,rgba(37,99,235,0.9),rgba(16,185,129,0.9))",
          boxShadow: "0 18px 55px rgba(37,99,235,0.55)",
        }}>
          <div style={{ borderRadius: 16, background: MOBILE_COLORS.cardBg,
            padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: MOBILE_COLORS.accentBlue,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 12px 32px rgba(37,99,235,0.7)",
            }}><StatusIcon size={24} color="#f9fafb" strokeWidth={2.3} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: MOBILE_COLORS.heading, marginBottom: 2 }}>
                CalVant</div>
              <div ref={statusRef} style={{ fontSize: 11, color: MOBILE_COLORS.textMuted, lineHeight: 1.4 }}>
                {STATUS_MESSAGES[step]}</div>
            </div>
          </div>
        </div>

        {/* Frameworks panel */}
        <div style={{
          padding: 10, borderRadius: 14, background: MOBILE_COLORS.panelBg,
          border: `1px solid ${MOBILE_COLORS.borderSoft}`,
          boxShadow: "0 2px 14px rgba(15,23,42,0.06)",
        }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.6,
            color: MOBILE_COLORS.textMuted, marginBottom: 8 }}>Frameworks</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MOBILE_TSCS.map((t, idx) => {
              const Icon = t.icon; const active = activeTsc === idx;
              return (
                <div key={t.id} style={{
                  padding: "7px 10px", borderRadius: 10,
                  border: `1px solid ${active ? MOBILE_COLORS.accentGreen : MOBILE_COLORS.borderSoft}`,
                  background: MOBILE_COLORS.cardBg,
                  display: "flex", alignItems: "center", gap: 8,
                  transform: active ? "scale(1.012)" : "scale(1)",
                  transition: "transform 0.16s, border-color 0.16s",
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={12} color={MOBILE_COLORS.accentGreen} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: MOBILE_COLORS.textBright }}>
                    {t.label}</div>
                  <div style={{ marginLeft: "auto", fontSize: 10,
                    color: active ? MOBILE_COLORS.accentGreen : MOBILE_COLORS.textMuted }}>
                    {active ? "Active" : "Ready"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== RESPONSIVE WRAPPER ==========

const SprintoConnections = ({ onConnectionClick, forceMode }) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 639px)").matches : false
  );
  useEffect(() => {
    if (forceMode === "desktop") { setIsMobile(false); return; }
    if (forceMode === "mobile")  { setIsMobile(true);  return; }
    const mq = window.matchMedia("(max-width: 639px)");
    const fn = e => setIsMobile(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [forceMode]);
  return isMobile
    ? <SprintoConnectionsMobile />
    : <SprintoConnectionsDesktop onConnectionClick={onConnectionClick} />;
};

export default SprintoConnections;