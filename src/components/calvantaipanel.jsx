"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/context/SessionContext";

function renderMarkdown(src, baseUrl = "https://api.calvant.com/rag-service") {
  if (!src) return "";
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  src = src.replace(
    /^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm,
    (_, header, rows) => {
      const ths = header.split("|").filter((c) => c.trim())
        .map((c) => `<th style="padding:6px 10px;text-align:left;border:1px solid #e2e8f0;background:#f8fafc">${esc(c.trim())}</th>`).join("");
      const trs = rows.trim().split("\n").map((row) => {
        const tds = row.split("|").filter((c) => c.trim())
          .map((c) => `<td style="padding:5px 10px;border:1px solid #e2e8f0">${esc(c.trim())}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("");
      return `<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:12px"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    }
  );
  src = src.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  src = src.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  src = src.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  src = src.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  src = src.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  src = src.replace(/\*(.+?)\*/g, "<em>$1</em>");
  src = src.replace(/📥 \[([^\]]+)\]\((\/[^)]+)\)/g, (_, text, href) =>
    `<a href="${baseUrl}${href}" download target="_blank" class="cv-dl-btn">⬇ ${esc(text)}</a>`);
  src = src.replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, (_, text, href) =>
    `<a href="${baseUrl}${href}" download target="_blank" class="cv-dl-btn">⬇ ${esc(text)}</a>`);
  src = src.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) =>
    `<pre class="cv-pre"><code>${esc(code)}</code></pre>`);
  src = src.replace(/`([^`]+)`/g, `<code class="cv-inline-code">$1</code>`);
  src = src.replace(/^(\s*[-*+] .+\n?)+/gm, (m) => {
    const items = m.trim().split("\n").map((li) => `<li>${li.replace(/^\s*[-*+] /, "").trim()}</li>`).join("");
    return `<ul>${items}</ul>`;
  });
  src = src.replace(/^(\s*\d+\. .+\n?)+/gm, (m) => {
    const items = m.trim().split("\n").map((li) => `<li>${li.replace(/^\s*\d+\. /, "").trim()}</li>`).join("");
    return `<ol>${items}</ol>`;
  });
  src = src.split("\n\n").map((p) => {
    p = p.trim();
    if (!p) return "";
    if (/^<(ul|ol|table|pre|h1|h2|h3)/i.test(p)) return p;
    return `<p>${p.replace(/\n/g, "<br/>")}</p>`;
  }).join("");
  return src;
}

// ── TUNNEL ANIMATION ───────────────────────────────────────────────────────────
function TunnelAnimation({ onComplete }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const DURATION = 2000;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 220 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 0.08 + 0.01,
      speed: Math.random() * 0.6 + 0.3,
      size: Math.random() * 2.5 + 0.5,
      hue: Math.random() * 60 + 160,
      brightness: Math.random() * 40 + 60,
    }));
    const draw = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const W = canvas.width; const H = canvas.height;
      const cx = W / 2; const cy = H / 2;
      const whiteFade = Math.max(0, (progress - 0.75) / 0.25);
      ctx.fillStyle = `rgba(${Math.round(whiteFade * 255)},${Math.round(whiteFade * 255)},${Math.round(whiteFade * 255)},0.18)`;
      ctx.fillRect(0, 0, W, H);
      if (progress < 0.02) { ctx.fillStyle = "#050a10"; ctx.fillRect(0, 0, W, H); }
      const ringCount = 18;
      for (let i = 0; i < ringCount; i++) {
        const t = ((progress * 3 + i / ringCount) % 1);
        const scale = Math.pow(t, 1.8);
        const r = scale * Math.max(W, H) * 0.75;
        const alpha = (1 - t) * 0.35 * (1 - whiteFade);
        const hue = 160 + i * 5 + progress * 120;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue},90%,65%,${alpha})`; ctx.lineWidth = 1.5 - t; ctx.stroke();
      }
      const burstAlpha = Math.sin(progress * Math.PI) * 0.6 * (1 - whiteFade);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.5);
      grad.addColorStop(0, `hsla(175,100%,70%,${burstAlpha})`);
      grad.addColorStop(0.4, `hsla(160,80%,50%,${burstAlpha * 0.3})`);
      grad.addColorStop(1, `hsla(150,60%,30%,0)`);
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      particles.forEach((p) => {
        p.angle += 0.002;
        const speed = p.speed * progress * 3.5;
        const dist = (p.radius + speed * elapsed * 0.00012) % 1;
        const r2 = dist * Math.max(W, H) * 0.85;
        const x = cx + Math.cos(p.angle) * r2; const y = cy + Math.sin(p.angle) * r2;
        const tailLen = speed * 18;
        const tx = cx + Math.cos(p.angle) * Math.max(0, r2 - tailLen);
        const ty = cy + Math.sin(p.angle) * Math.max(0, r2 - tailLen);
        const alpha2 = (1 - dist) * 0.9 * (1 - whiteFade);
        const g2 = ctx.createLinearGradient(tx, ty, x, y);
        g2.addColorStop(0, `hsla(${p.hue},90%,${p.brightness}%,0)`);
        g2.addColorStop(1, `hsla(${p.hue},90%,${p.brightness}%,${alpha2})`);
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y);
        ctx.strokeStyle = g2; ctx.lineWidth = p.size * (1 - dist * 0.5); ctx.stroke();
      });
      const coreSize = progress < 0.8 ? 4 + progress * 12 : ((progress - 0.8) / 0.2) * Math.max(W, H) * 1.4;
      const coreAlpha = progress < 0.85 ? 0.9 : 1;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
      coreGrad.addColorStop(0, `rgba(255,255,255,${coreAlpha})`);
      coreGrad.addColorStop(0.4, `hsla(175,100%,75%,${coreAlpha * 0.7})`);
      coreGrad.addColorStop(1, `hsla(175,100%,60%,0)`);
      ctx.fillStyle = coreGrad; ctx.beginPath(); ctx.arc(cx, cy, coreSize, 0, Math.PI * 2); ctx.fill();
      if (progress < 1) { rafRef.current = requestAnimationFrame(draw); } else { onComplete(); }
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [onComplete]);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 99998, display: "block", background: "#050a10" }} />;
}

// ── FULL-PAGE AURORA ───────────────────────────────────────────────────────────
function FullPageAurora() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const orbs = [
      { h: 185, s: 72, l: 78, sx: 0.18, sy: 0.12, px: 0,   py: 0,   rx: 0.75, ry: 0.55 },
      { h: 200, s: 65, l: 80, sx: 0.11, sy: 0.20, px: 2.0, py: 1.4, rx: 0.65, ry: 0.60 },
      { h: 160, s: 60, l: 82, sx: 0.22, sy: 0.09, px: 4.1, py: 2.8, rx: 0.70, ry: 0.50 },
      { h: 210, s: 55, l: 83, sx: 0.14, sy: 0.17, px: 1.1, py: 3.9, rx: 0.60, ry: 0.65 },
      { h: 172, s: 68, l: 79, sx: 0.19, sy: 0.13, px: 3.2, py: 0.7, rx: 0.72, ry: 0.48 },
    ];
    const draw = () => {
      const W = canvas.width; const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f0f8f6";
      ctx.fillRect(0, 0, W, H);
      orbs.forEach((o) => {
        const cx = W * (0.5 + 0.42 * Math.sin(t * o.sx + o.px));
        const cy = H * (0.5 + 0.35 * Math.cos(t * o.sy + o.py));
        const rx = W * o.rx; const ry = H * o.ry;
        const maxR = Math.max(rx, ry);
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        grd.addColorStop(0,    `hsla(${o.h},${o.s}%,${o.l}%,0.55)`);
        grd.addColorStop(0.45, `hsla(${o.h},${o.s}%,${o.l}%,0.20)`);
        grd.addColorStop(1,    `hsla(${o.h},${o.s}%,${o.l}%,0)`);
        ctx.save();
        ctx.translate(cx, cy); ctx.scale(rx / maxR, ry / maxR); ctx.translate(-cx, -cy);
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(cx, cy, maxR, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      t += 0.003;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function CalVantAIPanel() {
  const BASE_URL = "https://api.calvant.com/rag-service";
  const { isAuthenticated } = useSession();

  // ── 1. ALL STATE ──────────────────────────────────────────────────────────
  const [orgId,       setOrgId]       = useState("");
  const [userId,      setUserId]      = useState("");
  const [token,       setToken]       = useState("");
  const [phase,       setPhase]       = useState("idle");
  const [chatMode,    setChatMode]    = useState("welcome");
  const [sessionId,   setSessionId]   = useState(null);
  const [busy,        setBusy]        = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [inputVal,    setInputVal]    = useState("");
  const [sessions,    setSessions]    = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const msgsEndRef = useRef(null);
  const inputRef   = useRef(null);

  // ── 2. ALL CALLBACKS (no useEffect references above these) ───────────────

  const authHeaders = useCallback(
    (extra = {}) => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    }),
    [token]
  );

  const uploadHeaders = useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // loadSessions MUST be declared before any useEffect that calls it
  const loadSessions = useCallback(async (overrideOrgId, overrideUserId) => {
    const oid = overrideOrgId || orgId;
    const uid = overrideUserId || userId;
    if (!oid) return;
    try {
      const r = await fetch(
        `${BASE_URL}/api/chat/sessions?organizationId=${encodeURIComponent(oid)}&userId=${encodeURIComponent(uid)}`,
        { headers: authHeaders() }
      );
      if (!r.ok) return;
      setSessions(await r.json());
    } catch (_) {}
  }, [orgId, userId, authHeaders]);

  const openPanel = useCallback(() => setPhase("tunnel"), []);

  const handleTunnelComplete = useCallback(() => {
    setPhase("chat");
    loadSessions();
  }, [loadSessions]);

  const closePanel = useCallback(() => {
    setPhase("idle");
    setChatMode("welcome");
    setMessages([]);
    setSessionId(null);
  }, []);

  const openSession = useCallback(async (id) => {
    try {
      const r = await fetch(
        `${BASE_URL}/api/chat/session/${id}?organizationId=${encodeURIComponent(orgId)}`,
        { headers: authHeaders() }
      );
      if (!r.ok) return;
      const data = await r.json();
      setSessionId(id);
      setMessages(
        data.messages.map((m) => ({
          role: m.role.toLowerCase() === "user" ? "user" : "ai",
          content: m.content,
        }))
      );
      setSidebarOpen(false);
    } catch (_) {}
  }, [orgId, authHeaders]);

  const newSession = useCallback(async () => {
    try {
      const r = await fetch(`${BASE_URL}/api/chat/session/new`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ organizationId: orgId, userId }),
      });
      const data = await r.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setMessages([]);
        loadSessions();
        setSidebarOpen(false);
      }
    } catch (_) {}
  }, [orgId, userId, authHeaders, loadSessions]);

  const send = useCallback(async () => {
    const text = inputVal.trim();
    if (!text || busy) return;
    setBusy(true);
    setInputVal("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessages((prev) => [...prev, { role: "typing" }]);
    try {
      const r = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          message: text,
          organizationId: orgId,
          userId: userId || null,
          sessionId: sessionId || null,
          newSession: false,
        }),
      });
      const data = await r.json();
      setMessages((prev) => {
        const without = prev.filter((m) => m.role !== "typing");
        if (!r.ok) return [...without, { role: "error", content: data.error || "Server error" }];
        if (data.sessionId) setSessionId(data.sessionId);
        loadSessions();
        return [...without, { role: "ai", content: data.reply || data.message || "", data }];
      });
    } catch (e) {
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "typing"),
        { role: "error", content: "Network error — is the server running at " + BASE_URL + "?" },
      ]);
    }
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [inputVal, busy, orgId, userId, sessionId, authHeaders, loadSessions]);

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    setMessages((prev) => [...prev, { role: "user", content: `📎 Uploading: ${file.name}` }]);
    setMessages((prev) => [...prev, { role: "uploading" }]);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("organizationId", orgId);
    if (sessionId) fd.append("sessionId", sessionId);
    try {
      const r = await fetch(`${BASE_URL}/api/chat/upload`, {
        method: "POST",
        headers: uploadHeaders(),
        body: fd,
      });
      const data = await r.json();
      setMessages((prev) => {
        const without = prev.filter((m) => m.role !== "uploading");
        if (r.ok) {
          if (data.sessionId && !sessionId) setSessionId(data.sessionId);
          return [...without, { role: "upload-ok", content: data.message || "Uploaded successfully.", chunks: data.chunksIndexed }];
        }
        return [...without, { role: "error", content: data.error || "Upload failed" }];
      });
    } catch (e) {
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "uploading"),
        { role: "error", content: "Upload failed: " + e.message },
      ]);
    }
  }, [orgId, sessionId, uploadHeaders]);

  // ── 3. ALL useEFFECTS (after all callbacks) ───────────────────────────────

  // Read user from sessionStorage on mount — call loadSessions immediately with fresh values
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        const oid = String(u?.organization || u?.organization?.id || "");
        const uid = String(u?._id || u?.id || u?.userId || u?.email || "");
        const tok = String(u?.token || "");
        setOrgId(oid);
        setUserId(uid);
        setToken(tok);
        if (oid) loadSessions(oid, uid);
      }
    } catch (_) {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (phase === "chat") setTimeout(() => inputRef.current?.focus(), 300);
  }, [phase]);

  useEffect(() => {
    if (phase === "chat" && orgId) loadSessions();
  }, [phase, orgId, loadSessions]);

  useEffect(() => {
    if (messages.length > 0 && chatMode === "welcome") setChatMode("chatting");
    if (messages.length === 0) setChatMode("welcome");
  }, [messages]);

  // ── 4. NON-HOOK HELPERS ───────────────────────────────────────────────────

  const useSuggestion = (text) => {
    setInputVal(text);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    if (e.key === "Escape") closePanel();
  };

  const InputBox = (
    <div className="cvai-inputbox">
      <div className="cvai-inputbox-inner">
        <label className="cvai-attach-btn" title="Upload document">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          <input type="file" accept=".pdf,.docx,.xlsx,.csv" style={{ display: "none" }}
            onChange={(e) => { handleFileUpload(e.target.files[0]); e.target.value = ""; }} />
        </label>
        <textarea ref={inputRef} className="cvai-textarea" rows={1} placeholder="Ask anything…"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px";
          }}
          onKeyDown={handleKeyDown}
        />
        <button className="cvai-send-btn" onClick={send} disabled={busy || !inputVal.trim()} aria-label="Send">
          {busy ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" strokeDasharray="28 28" style={{ animation: "cvai-spin 1s linear infinite" }}/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
      <div className="cvai-hint">Enter to send · Shift+Enter for new line · 📎 to upload</div>
    </div>
  );

  // ── 5. RENDER ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600&family=Google+Sans+Text:wght@400;500&display=swap');

        .cvai-fab{position:fixed;bottom:28px;right:28px;z-index:9997;display:flex;align-items:center;gap:10px;padding:0 22px;height:52px;border-radius:26px;border:none;cursor:pointer;background:linear-gradient(135deg,#0f766e 0%,#065f46 60%,#064e3b 100%);box-shadow:0 4px 24px rgba(16,185,129,0.45);animation:cvai-pulse 3s ease-in-out infinite;transition:transform 0.2s,box-shadow 0.2s;font-family:'Google Sans',-apple-system,sans-serif;}
        .cvai-fab:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 8px 32px rgba(16,185,129,0.6);animation:none;}
        @keyframes cvai-pulse{0%,100%{box-shadow:0 4px 24px rgba(16,185,129,0.4),0 0 0 0 rgba(16,185,129,0.35);}50%{box-shadow:0 4px 24px rgba(16,185,129,0.4),0 0 0 10px rgba(16,185,129,0);}}
        .cvai-fab-label{font-size:13.5px;font-weight:700;color:#fff;letter-spacing:0.3px;white-space:nowrap;}
        .cvai-fab-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px #4ade80;animation:cvai-blink 2s ease-in-out infinite;flex-shrink:0;}
        @keyframes cvai-blink{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes cvai-spin{to{transform:rotate(360deg)}}

        .cvai-overlay{position:fixed;inset:0;z-index:99999;display:flex;font-family:'Google Sans Text','Google Sans',-apple-system,sans-serif;animation:cvai-fadein 0.35s ease;overflow:hidden;}
        @keyframes cvai-fadein{from{opacity:0;transform:scale(1.015)}to{opacity:1;transform:scale(1)}}

        .cvai-sidebar{width:260px;background:rgba(255,255,255,0.75);backdrop-filter:blur(16px);border-right:1px solid rgba(0,0,0,0.07);display:flex;flex-direction:column;flex-shrink:0;position:relative;z-index:2;transition:transform 0.25s ease;}
        .cvai-sidebar-head{padding:18px 14px 14px;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;align-items:center;gap:10px;}
        .cvai-new-btn{flex:1;padding:9px 14px;border:none;border-radius:24px;background:#e8f5e9;color:#0d6b52;font-size:13.5px;font-weight:600;cursor:pointer;transition:background 0.15s;font-family:'Google Sans',sans-serif;display:flex;align-items:center;gap:7px;}
        .cvai-new-btn:hover{background:#c8e6c9;}
        .cvai-session-list{flex:1;overflow-y:auto;padding:8px 0;}
        .cvai-session-item{padding:10px 16px;cursor:pointer;transition:background 0.1s;border-radius:0 24px 24px 0;margin-right:12px;}
        .cvai-session-item:hover{background:rgba(0,0,0,0.04);}
        .cvai-session-item.active{background:#e6f4ea;}
        .cvai-session-title{font-size:13px;color:#3c4043;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;}
        .cvai-session-date{font-size:11px;color:#9aa0a6;margin-top:2px;}

        .cvai-main{flex:1;display:flex;flex-direction:column;min-width:0;position:relative;}
        .cvai-aurora-fill{position:absolute;inset:0;z-index:0;}

        .cvai-header{position:relative;z-index:2;padding:12px 20px;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;align-items:center;gap:12px;flex-shrink:0;background:rgba(255,255,255,0.65);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
        .cvai-header-logo{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#1a9e7f 0%,#0d6b52 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .cvai-header-title{font-size:17px;font-weight:600;color:#202124;font-family:'Google Sans',sans-serif;letter-spacing:-0.2px;}
        .cvai-header-sub{margin-left:auto;font-size:12px;color:#5f6368;display:flex;align-items:center;gap:6px;}
        .cvai-status-dot{width:7px;height:7px;border-radius:50%;background:#34a853;box-shadow:0 0 0 2px rgba(52,168,83,0.2);}
        .cvai-status-dot.thinking{background:#fbbc04;animation:cvai-blink 0.8s ease-in-out infinite;}
        .cvai-close-btn{margin-left:12px;width:36px;height:36px;border-radius:50%;border:none;background:transparent;color:#5f6368;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:background 0.15s;}
        .cvai-close-btn:hover{background:rgba(0,0,0,0.06);color:#202124;}

        .cvai-cfg{position:relative;z-index:2;padding:6px 20px;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;align-items:center;gap:8px;flex-shrink:0;background:rgba(255,255,255,0.5);backdrop-filter:blur(10px);flex-wrap:wrap;}
        .cvai-cfg-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.8);font-size:11px;}
        .cvai-cfg-lbl{font-weight:700;color:#9aa0a6;text-transform:uppercase;font-size:9px;letter-spacing:0.06em;}
        .cvai-cfg-val{color:#3c4043;font-weight:600;font-family:monospace;font-size:11px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cvai-sess-strip{position:relative;z-index:2;padding:4px 20px;border-bottom:1px solid rgba(0,0,0,0.06);font-size:11px;color:#9aa0a6;display:flex;gap:6px;flex-shrink:0;background:rgba(255,255,255,0.45);backdrop-filter:blur(10px);}
        .cvai-sess-id{font-family:monospace;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

        .cvai-welcome-screen{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px 60px;animation:cvai-fadein 0.4s ease;}
        .cvai-welcome-greeting{font-size:36px;font-weight:500;font-family:'Google Sans',sans-serif;color:#1a3a2f;letter-spacing:-0.5px;margin-bottom:14px;text-align:center;text-shadow:0 1px 20px rgba(255,255,255,0.8);}
        .cvai-welcome-sub{font-size:15px;color:#4a6741;max-width:460px;line-height:1.65;text-align:center;margin-bottom:32px;text-shadow:0 1px 10px rgba(255,255,255,0.7);}
        .cvai-starters{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;max-width:620px;margin-bottom:36px;}
        .cvai-starter{font-size:13px;padding:9px 18px;border-radius:22px;border:1px solid rgba(13,107,82,0.25);background:rgba(255,255,255,0.72);color:#1a3a2f;cursor:pointer;transition:all 0.18s;box-shadow:0 2px 8px rgba(0,0,0,0.06);backdrop-filter:blur(8px);font-family:'Google Sans',sans-serif;}
        .cvai-starter:hover{background:rgba(255,255,255,0.92);border-color:rgba(13,107,82,0.5);transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,0.1);}
        .cvai-welcome-screen .cvai-inputbox{width:100%;max-width:680px;}

        .cvai-chat-screen{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;min-height:0;}

        .cvai-msgs{flex:1;overflow-y:auto;padding:24px 20px;display:flex;flex-direction:column;gap:16px;background:transparent;}
        .cvai-msgs::-webkit-scrollbar{width:6px;}
        .cvai-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:6px;}
        .cvai-msg{display:flex;flex-direction:column;max-width:80%;animation:cvai-msg-in 0.25s ease;}
        @keyframes cvai-msg-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .cvai-msg.user{align-self:flex-end;align-items:flex-end;}
        .cvai-msg.ai{align-self:flex-start;align-items:flex-start;}
        .cvai-bubble{padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.7;word-break:break-word;}
        .cvai-msg.user .cvai-bubble{background:#0d6b52;color:#fff;border-bottom-right-radius:4px;white-space:pre-wrap;}
        .cvai-msg.ai .cvai-bubble{background:rgba(255,255,255,0.88);border:1px solid rgba(0,0,0,0.08);border-bottom-left-radius:4px;color:#202124;box-shadow:0 2px 8px rgba(0,0,0,0.06);backdrop-filter:blur(8px);}
        .cvai-bubble.err{background:rgba(252,232,230,0.9);border:1px solid #f5c6c2;color:#c5221f;}
        .cvai-bubble.ok{background:rgba(230,244,234,0.9);border:1px solid #ceead6;color:#137333;}
        .cvai-bubble h1,.cvai-bubble h2,.cvai-bubble h3{color:#202124;margin:10px 0 5px;font-weight:600;font-family:'Google Sans',sans-serif;}
        .cvai-bubble h1{font-size:16px;}.cvai-bubble h2{font-size:14px;}.cvai-bubble h3{font-size:13px;}
        .cvai-bubble p{margin:0 0 8px;}.cvai-bubble p:last-child{margin:0;}
        .cvai-bubble strong{color:#202124;font-weight:600;}
        .cvai-bubble ul,.cvai-bubble ol{padding-left:20px;margin:6px 0;}
        .cvai-bubble li{margin:3px 0;font-size:13.5px;color:#3c4043;}
        .cvai-bubble table{border-collapse:collapse;width:100%;margin:8px 0;}
        .cvai-bubble th{background:#f1f3f4;color:#0d6b52;font-size:11px;text-transform:uppercase;font-family:'Google Sans',sans-serif;}
        .cvai-bubble th,.cvai-bubble td{padding:6px 10px;border:1px solid #e8eaed;}
        .cv-pre{font-family:monospace;font-size:12px;background:rgba(248,249,250,0.9);border:1px solid #e8eaed;padding:12px;border-radius:8px;color:#202124;overflow-x:auto;margin:8px 0;}
        .cv-inline-code{font-family:monospace;font-size:12px;background:rgba(241,243,244,0.9);padding:2px 6px;border-radius:4px;color:#0d6b52;}
        .cv-dl-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;margin-top:8px;background:#0d6b52;color:#fff;border-radius:20px;text-decoration:none;font-size:13px;font-weight:600;transition:background 0.15s;font-family:'Google Sans',sans-serif;}
        .cv-dl-btn:hover{background:#0f766e;}

        .cvai-typing{display:flex;gap:5px;align-items:center;padding:4px 2px;}
        .cvai-typing span{width:7px;height:7px;border-radius:50%;background:#9aa0a6;animation:cvai-bounce 1.4s ease infinite;}
        .cvai-typing span:nth-child(2){animation-delay:0.18s;}
        .cvai-typing span:nth-child(3){animation-delay:0.36s;}
        @keyframes cvai-bounce{0%,80%,100%{transform:scale(1);opacity:0.5}40%{transform:scale(1.35);opacity:1}}

        .cvai-sug-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
        .cvai-sug-btn{font-size:12px;padding:5px 13px;border-radius:16px;border:1px solid #ceead6;color:#0d6b52;background:rgba(230,244,234,0.9);cursor:pointer;transition:all 0.15s;font-family:'Google Sans',sans-serif;}
        .cvai-sug-btn:hover{background:#c8e6c9;border-color:#0d6b52;}

        .cvai-src-chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;}
        .cvai-src-chip{font-size:11px;padding:3px 9px;border-radius:12px;background:rgba(241,243,244,0.9);border:1px solid #e8eaed;color:#5f6368;}

        .cvai-badge{padding:2px 9px;border-radius:12px;font-size:10px;font-weight:700;font-family:'Google Sans',sans-serif;}
        .cvai-b-doc{background:#e6f4ea;color:#137333;border:1px solid #ceead6;}
        .cvai-b-tool{background:#e8f0fe;color:#1a73e8;border:1px solid #c5d4fb;}
        .cvai-b-gen{background:#f1f3f4;color:#5f6368;border:1px solid #e8eaed;}
        .cvai-b-docgen{background:#f3e8fd;color:#7c3aed;border:1px solid #ddd6fe;}
        .cvai-b-sys{background:#fef7e0;color:#b06000;border:1px solid #fce8b2;}
        .cvai-meta{display:flex;align-items:center;gap:6px;margin-top:5px;font-size:10.5px;color:#9aa0a6;}

        .cvai-inputbox{padding:0 0 4px;}
        .cvai-inputbox-inner{display:flex;align-items:flex-end;gap:8px;background:rgba(255,255,255,0.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(0,0,0,0.1);border-radius:28px;padding:10px 12px 10px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.05);transition:box-shadow 0.2s;}
        .cvai-inputbox-inner:focus-within{box-shadow:0 4px 28px rgba(13,107,82,0.18),0 1px 6px rgba(0,0,0,0.08);border-color:rgba(13,107,82,0.35);}
        .cvai-attach-btn{width:36px;height:36px;border-radius:50%;background:transparent;border:1px solid rgba(0,0,0,0.1);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;color:#5f6368;}
        .cvai-attach-btn:hover{background:rgba(0,0,0,0.05);border-color:rgba(0,0,0,0.2);}
        .cvai-textarea{flex:1;background:transparent;border:none;padding:8px 4px;color:#202124;font-size:15px;resize:none;line-height:1.55;max-height:130px;overflow-y:auto;font-family:'Google Sans Text',sans-serif;outline:none;}
        .cvai-textarea::placeholder{color:#9aa0a6;}
        .cvai-send-btn{width:40px;height:40px;border-radius:50%;background:#0d6b52;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.18s;box-shadow:0 2px 8px rgba(13,107,82,0.3);}
        .cvai-send-btn:hover{background:#0f766e;transform:scale(1.07);}
        .cvai-send-btn:disabled{background:#dadce0;cursor:not-allowed;box-shadow:none;transform:none;}

        .cvai-bottom-bar{position:relative;z-index:2;padding:12px 20px 18px;background:rgba(255,255,255,0.35);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid rgba(0,0,0,0.06);}
        .cvai-hint{font-size:11px;color:rgba(0,0,0,0.35);margin-top:7px;text-align:center;letter-spacing:0.2px;}

        .cvai-upload-bar{height:3px;border-radius:2px;background:linear-gradient(90deg,#1a9e7f,#1a73e8);animation:cvai-progress 2s ease-in-out infinite;margin-top:10px;}
        @keyframes cvai-progress{0%{width:10%}50%{width:80%}100%{width:90%}}

        .cvai-action-card{margin-top:10px;background:rgba(255,255,255,0.9);border:1px solid #e8eaed;border-radius:16px;padding:14px 16px;max-width:400px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
        .cvai-action-card h4{font-size:12px;color:#5f6368;margin-bottom:10px;font-weight:600;font-family:'Google Sans',sans-serif;}
        .cvai-tpl-list{display:flex;flex-direction:column;gap:5px;margin-bottom:8px;max-height:160px;overflow-y:auto;}
        .cvai-tpl-item{padding:7px 11px;border-radius:10px;border:1px solid #e8eaed;background:#f8f9fa;cursor:pointer;font-size:12.5px;transition:all 0.15s;display:flex;align-items:center;gap:8px;color:#3c4043;}
        .cvai-tpl-item:hover{border-color:#0d6b52;color:#0d6b52;background:#e6f4ea;}
        .cvai-tpl-type{font-size:9.5px;padding:2px 7px;border-radius:10px;font-family:'Google Sans',sans-serif;background:#e8f0fe;color:#1a73e8;flex-shrink:0;}

        .cvai-menu-btn{display:none;width:32px;height:32px;border-radius:8px;border:1px solid rgba(0,0,0,0.1);background:transparent;color:#5f6368;cursor:pointer;font-size:18px;align-items:center;justify-content:center;}
        @media(max-width:680px){
          .cvai-sidebar{position:absolute;left:0;top:0;bottom:0;z-index:10;transform:translateX(-100%);box-shadow:4px 0 24px rgba(0,0,0,0.12);}
          .cvai-sidebar.open{transform:translateX(0);}
          .cvai-menu-btn{display:flex;}
          .cvai-welcome-greeting{font-size:26px;}
        }
      `}</style>

      {phase === "idle" && isAuthenticated && (
        <button className="cvai-fab" onClick={openPanel} aria-label="Open CalVant AI">
          <span className="cvai-fab-label">AI Copilot</span>
          <span className="cvai-fab-dot" />
        </button>
      )}

      {phase === "tunnel" && <TunnelAnimation onComplete={handleTunnelComplete} />}

      {phase === "chat" && (
        <div className="cvai-overlay">

          <div className={`cvai-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="cvai-sidebar-head">
              <button className="cvai-new-btn" onClick={newSession}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New chat
              </button>
            </div>
            <div className="cvai-session-list">
              {sessions.map((s) => (
                <div key={s.sessionId}
                  className={`cvai-session-item ${s.sessionId === sessionId ? "active" : ""}`}
                  onClick={() => openSession(s.sessionId)}>
                  <div className="cvai-session-title">{s.title || s.preview || "New Chat"}</div>
                  <div className="cvai-session-date">{new Date(s.updatedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="cvai-main">
            <div className="cvai-aurora-fill"><FullPageAurora /></div>

            <div className="cvai-header">
              <button className="cvai-menu-btn" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
              <div className="cvai-header-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
                </svg>
              </div>
              <span className="cvai-header-title">AI Copilot</span>
              <span className="cvai-header-sub">
                <span className={`cvai-status-dot ${busy ? "thinking" : ""}`} />
                {busy ? "Thinking…" : "Ready"}
              </span>
              <button className="cvai-close-btn" onClick={closePanel} aria-label="Close">✕</button>
            </div>

            <div className="cvai-cfg">
              <span className="cvai-cfg-chip">
                <span className="cvai-cfg-lbl">Org</span>
                <span className="cvai-cfg-val">{orgId || "—"}</span>
              </span>
              <span className="cvai-cfg-chip">
                <span className="cvai-cfg-lbl">User</span>
                <span className="cvai-cfg-val">{userId || "—"}</span>
              </span>
            </div>
            <div className="cvai-sess-strip">
              <span>Session:</span>
              <span className="cvai-sess-id">{sessionId || "none — first message will create one"}</span>
            </div>

            {chatMode === "welcome" && (
              <div className="cvai-welcome-screen">
                <div className="cvai-welcome-greeting">Hello, how can I help?</div>
                <p className="cvai-welcome-sub">
                  Ask me about compliance, your documents, or how to use the platform.
                  I can also generate policies and procedures.
                </p>
                <div className="cvai-starters">
                  {["How do I log a risk?","What are the key requirements of GDPR?","Generate an Information Security Policy","What is ISO 27001?","Summarise this document"].map((s) => (
                    <button key={s} className="cvai-starter"
                      onClick={() => { setInputVal(s); setTimeout(() => send(), 0); }}>{s}</button>
                  ))}
                </div>
                {InputBox}
              </div>
            )}

            {chatMode === "chatting" && (
              <div className="cvai-chat-screen">
                <div className="cvai-msgs">
                  {messages.map((msg, i) => {
                    if (msg.role === "user") return (
                      <div key={i} className="cvai-msg user"><div className="cvai-bubble">{msg.content}</div></div>
                    );
                    if (msg.role === "typing") return (
                      <div key={i} className="cvai-msg ai"><div className="cvai-bubble"><div className="cvai-typing"><span/><span/><span/></div></div></div>
                    );
                    if (msg.role === "uploading") return (
                      <div key={i} className="cvai-msg ai"><div className="cvai-bubble">
                        <div style={{ fontSize: 12, color: "#5f6368", marginBottom: 4 }}>Uploading and indexing…</div>
                        <div className="cvai-upload-bar" style={{ width: "100%" }}/>
                      </div></div>
                    );
                    if (msg.role === "upload-ok") return (
                      <div key={i} className="cvai-msg ai">
                        <div className="cvai-bubble ok">✅ {msg.content}</div>
                        <div className="cvai-sug-row">
                          {["Summarise this document","What are the key risks?","List the compliance requirements"].map((s) => (
                            <button key={s} className="cvai-sug-btn" onClick={() => useSuggestion(s)}>{s}</button>
                          ))}
                        </div>
                        <div className="cvai-meta">
                          <span className="cvai-badge cvai-b-sys">Upload</span>
                          {msg.chunks && <span style={{ color: "#34a853" }}>{msg.chunks} chunks indexed</span>}
                        </div>
                      </div>
                    );
                    if (msg.role === "error") return (
                      <div key={i} className="cvai-msg ai"><div className="cvai-bubble err">⚠ {msg.content}</div></div>
                    );

                    const d = msg.data || {};
                    const rendered = renderMarkdown(msg.content, BASE_URL);
                    const badgeCls =
                      d.mode === "DOC"    ? "cvai-b-doc"    :
                      d.mode === "TOOL"   ? "cvai-b-tool"   :
                      d.mode === "DOCGEN" ? "cvai-b-docgen" :
                      d.mode === "SYSTEM" ? "cvai-b-sys"    : "cvai-b-gen";

                    return (
                      <div key={i} className="cvai-msg ai">
                        <div className="cvai-bubble" style={{ whiteSpace: "normal" }}
                          dangerouslySetInnerHTML={{ __html: rendered }} />

                        {d.sources?.length > 0 && (
                          <div className="cvai-src-chips">
                            {d.sources.map((s) => <span key={s} className="cvai-src-chip">📎 {s}</span>)}
                          </div>
                        )}

                        {d.action === "SHOW_TEMPLATE_PICKER" && d.actionPayload?.templates?.length > 0 && (
                          <div className="cvai-action-card">
                            <h4>📋 Pick a template</h4>
                            <div className="cvai-tpl-list">
                              {d.actionPayload.templates.slice(0, 6).map((t) => (
                                <div key={t.id} className="cvai-tpl-item"
                                  onClick={() => { setInputVal("Generate a " + t.name); setTimeout(() => send(), 0); }}>
                                  <span className="cvai-tpl-type">{t.documentType}</span>{t.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {d.action === "DOCUMENT_READY" && d.actionPayload && (() => {
                          const p = d.actionPayload;
                          const dlUrl = `${BASE_URL}/api/documents/${encodeURIComponent(p.documentId)}/pdf?organizationId=${encodeURIComponent(p.organizationId || orgId)}`;
                          return (
                            <div className="cvai-action-card" style={{ borderColor: "#ceead6" }}>
                              <h4 style={{ color: "#34a853" }}>✅ Document Ready</h4>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#202124", margin: "6px 0 2px", fontFamily: "'Google Sans',sans-serif" }}>
                                {p.title || "Generated Document"}
                              </div>
                              {p.templateName && <div style={{ fontSize: 12, color: "#9aa0a6", marginBottom: 12 }}>{p.templateName}</div>}
                              <a href={dlUrl} download={`${(p.title || "document").replaceAll(" ", "_")}.pdf`} className="cv-dl-btn">
                                ⬇ Download PDF
                              </a>
                            </div>
                          );
                        })()}

                        {d.suggestions?.length > 0 && !d.action && (
                          <div className="cvai-sug-row">
                            {d.suggestions.map((s) => (
                              <button key={s} className="cvai-sug-btn" onClick={() => useSuggestion(s)}>{s}</button>
                            ))}
                          </div>
                        )}

                        {d.mode && (
                          <div className="cvai-meta">
                            <span className={`cvai-badge ${badgeCls}`}>{d.intent || d.mode}</span>
                            {d.confidence && (
                              <span style={{ color: d.confidence[0] === "H" ? "#34a853" : d.confidence[0] === "M" ? "#fbbc04" : "#ea4335" }}>
                                {d.confidence}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={msgsEndRef}/>
                </div>
                <div className="cvai-bottom-bar">{InputBox}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}