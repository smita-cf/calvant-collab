"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  LifeBuoy,
  Plus,
  X,
  Loader2,
  ChevronLeft,
  AlertCircle,
  Mail,
  RefreshCw,
  Paperclip,
  FileText,
  Download,
} from "lucide-react";
import supportService from "../services/supportService";

// ── Attachment helpers ───────────────────────────────────────────────────────

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB — matches support-service's cap
const MAX_ATTACHMENTS = 5;

const fmtBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

// root / super_admin see every ticket raised across their organization, so
// the list gains a "Raised by" column and the reply thread shows who raised
// it. Everyone else only ever sees their own tickets, so that context would
// be redundant.
const isOrgAdmin = (user) => {
  const roles = Array.isArray(user?.role) ? user.role : [user?.role || ""];
  const normalized = roles.map((r) => (r || "").toString().toLowerCase());
  return normalized.includes("root") || normalized.includes("super_admin");
};

const CATEGORIES = ["General", "Billing", "Technical", "Access", "Other"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const STATUS_STYLE = {
  OPEN: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", label: "Open" },
  IN_PROGRESS: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", label: "In Progress" },
  RESOLVED: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", label: "Resolved" },
  CLOSED: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", label: "Closed" },
};

const PRIORITY_STYLE = {
  LOW: { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
  MEDIUM: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  HIGH: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  URGENT: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
};

const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const fmtShortDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const initials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || name[0]?.toUpperCase();
};

const avatarColor = (seed) => {
  const palette = ["#2563eb", "#7c3aed", "#0891b2", "#ea580c", "#059669", "#c026d3"];
  let hash = 0;
  for (const ch of seed || "?") hash = (hash * 31 + ch.charCodeAt(0)) % palette.length;
  return palette[Math.abs(hash) % palette.length];
};

// ── Small UI atoms ───────────────────────────────────────────────────────────

const Badge = ({ palette, children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: palette.bg,
      color: palette.text,
      border: `1px solid ${palette.border}`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const EmptyState = ({ onNew }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "60px 24px",
      color: "#64748b",
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
      }}
    >
      <LifeBuoy size={26} color="#2563eb" />
    </div>
    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
      No support tickets yet
    </h3>
    <p style={{ margin: "6px 0 20px", fontSize: 14, maxWidth: 320 }}>
      Run into an issue or have a question? Raise a ticket and our team will get back to you —
      by email or right here.
    </p>
    <button onClick={onNew} style={primaryBtnStyle}>
      <Plus size={16} /> New Ticket
    </button>
  </div>
);

const primaryBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#334155",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  fontFamily: "inherit",
};

// ── Attachment picker — used in both the New Ticket modal and the reply box ─

const AttachmentPicker = ({ files, setFiles, error, setError }) => {
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    setError("");

    const combined = [...files, ...incoming];
    if (combined.length > MAX_ATTACHMENTS) {
      setError(`You can attach at most ${MAX_ATTACHMENTS} file(s).`);
      return;
    }
    const tooBig = incoming.find((f) => f.size > MAX_ATTACHMENT_SIZE);
    if (tooBig) {
      setError(`${tooBig.name} is too large — max ${fmtBytes(MAX_ATTACHMENT_SIZE)} per file.`);
      return;
    }
    setFiles(combined);
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "1px dashed #cbd5e1",
          borderRadius: 8,
          padding: "7px 12px",
          fontSize: 13,
          fontWeight: 600,
          color: "#475569",
          cursor: "pointer",
        }}
      >
        <Paperclip size={14} /> Attach files
      </button>

      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#334155",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "6px 10px",
              }}
            >
              <FileText size={14} color="#64748b" />
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.name}
              </span>
              <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>{fmtBytes(f.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", flexShrink: 0, display: "flex" }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Attachments already on a sent message — shown as download chips ────────

const AttachmentChips = ({ attachments, ticketId }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      {attachments.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => supportService.downloadAttachment(ticketId, a.id, a.fileName)}
          title={`Download ${a.fileName}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
          }}
        >
          <FileText size={13} color="#64748b" />
          <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {a.fileName}
          </span>
          <span style={{ color: "#94a3b8", fontWeight: 500 }}>{fmtBytes(a.size)}</span>
          <Download size={12} color="#64748b" />
        </button>
      ))}
    </div>
  );
};

// ── New Ticket modal ─────────────────────────────────────────────────────────

const NewTicketModal = ({ onClose, onCreated }) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState("MEDIUM");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError("Subject and description are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const ticket = await supportService.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        files,
      });
      onCreated(ticket);
    } catch (err) {
      setError(err.message || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
            New Support Ticket
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Subject</label>
            <input
              style={inputStyle}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              maxLength={150}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority</label>
              <select style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 110, fontFamily: "inherit" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what's happening — steps to reproduce, error messages, anything that helps."
            />
          </div>

          <div>
            <label style={labelStyle}>Attachments (optional)</label>
            <AttachmentPicker files={files} setFiles={setFiles} error={error} setError={setError} />
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#b91c1c", fontSize: 13 }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" style={secondaryBtnStyle} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" style={primaryBtnStyle} disabled={submitting}>
              {submitting && <Loader2 size={16} className="spin" />}
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b",
  marginBottom: 6,
};

// ── A single message in the thread, styled as an email, not a chat bubble ──

const MessageRow = ({ msg, isLast, ticketId }) => {
  const displayName = msg.senderRole === "admin" ? "CalVant" : (msg.senderName || "You");
  const fromEmail = msg.channel === "EMAIL";

  return (
    <div style={{ display: "flex", gap: 14, padding: "20px 0", borderBottom: isLast ? "none" : "1px solid #f1f5f9" }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: msg.senderRole === "admin" ? "#000" : avatarColor(displayName),
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {msg.senderRole === "admin" ? (
          <img
            src="/favicon-light.png"
            alt="CalVant"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          initials(displayName)
        )}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{displayName}</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(msg.createdAt)}</span>
          {fromEmail && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: "#64748b",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: 999,
                padding: "1px 8px",
              }}
            >
              <Mail size={10} /> via Email
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#334155",
            whiteSpace: "pre-wrap",
          }}
        >
          {msg.message}
        </div>
        <AttachmentChips attachments={msg.attachments} ticketId={ticketId} />
      </div>
    </div>
  );
};

// ── Ticket thread / detail view — styled like a support-desk email view ────

const TicketThread = ({ ticket, isAdmin, onBack, onReply }) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const statusPalette = STATUS_STYLE[ticket.status] || STATUS_STYLE.OPEN;
  const priorityPalette = PRIORITY_STYLE[ticket.priority] || PRIORITY_STYLE.MEDIUM;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError("");
    try {
      await onReply(ticket.id, message.trim(), files);
      setMessage("");
      setFiles([]);
    } catch (err) {
      setError(err.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#2563eb",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
          marginBottom: 16,
        }}
      >
        <ChevronLeft size={16} /> Back to all tickets
      </button>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Main thread column */}
        <div style={{ flex: "1 1 560px", minWidth: 0 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <Badge palette={statusPalette}>{statusPalette.label}</Badge>
              <Badge palette={priorityPalette}>{ticket.priority}</Badge>
              {ticket.category && <Badge palette={PRIORITY_STYLE.LOW}>{ticket.category}</Badge>}
            </div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "#0f172a" }}>{ticket.subject}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
              {ticket.ticketNumber} &middot; opened {fmtDate(ticket.createdAt)}
            </p>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "4px 24px" }}>
            {(ticket.messages || []).map((m, i) => (
              <MessageRow key={i} msg={m} isLast={i === ticket.messages.length - 1} ticketId={ticket.id} />
            ))}
          </div>

          {/* Reply — a mail compose box, not a chat input */}
          <div style={{ marginTop: 16 }}>
            <form
              onSubmit={handleSend}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>
                Reply
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your reply here..."
                style={{
                  width: "100%",
                  minHeight: 140,
                  border: "none",
                  outline: "none",
                  resize: "vertical",
                  padding: "16px",
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "#0f172a",
                  lineHeight: 1.6,
                }}
              />
              <div style={{ padding: "0 16px 12px" }}>
                <AttachmentPicker files={files} setFiles={setFiles} error={error} setError={setError} />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderTop: "1px solid #f1f5f9",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  You can also reply straight from your email — we'll add it to this thread automatically.
                </span>
                <button type="submit" style={primaryBtnStyle} disabled={sending || !message.trim()}>
                  {sending && <Loader2 size={16} className="spin" />}
                  {sending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#b91c1c", fontSize: 13, marginTop: 8 }}>
                <AlertCircle size={15} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Info side panel */}
        <div style={{ flex: "0 1 260px", minWidth: 220 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
            <InfoRow label="Id" value={ticket.ticketNumber} />
            {isAdmin && <InfoRow label="Raised by" value={`${ticket.raisedByName || "—"}${ticket.raisedByEmail ? ` (${ticket.raisedByEmail})` : ""}`} />}
            <InfoRow label="Created" value={fmtDate(ticket.createdAt)} />
            <InfoRow label="Last update" value={fmtDate(ticket.updatedAt)} />
            <InfoRow label="Category" value={ticket.category || "—"} last />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, last }) => (
  <div style={{ padding: "10px 0", borderBottom: last ? "none" : "1px solid #f1f5f9" }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>
      {label}
    </div>
    <div style={{ fontSize: 13, color: "#0f172a", wordBreak: "break-word" }}>{value}</div>
  </div>
);

// ── Ticket list row — a table row, not a chat-list card ─────────────────────

const TicketListHeader = ({ showRaisedBy }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 16px",
      fontSize: 11,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      borderBottom: "1px solid #e2e8f0",
    }}
  >
    <span style={{ flex: "1 1 auto", minWidth: 0 }}>Subject</span>
    {showRaisedBy && <span style={{ width: 140, flexShrink: 0 }}>Raised by</span>}
    <span style={{ width: 90, flexShrink: 0 }}>Id</span>
    <span style={{ width: 110, flexShrink: 0 }}>Created</span>
    <span style={{ width: 130, flexShrink: 0 }}>Last comment</span>
    <span style={{ width: 100, flexShrink: 0, textAlign: "right" }}>Status</span>
  </div>
);

const TicketRow = ({ ticket, onOpen, showRaisedBy }) => {
  const statusPalette = STATUS_STYLE[ticket.status] || STATUS_STYLE.OPEN;

  return (
    <button
      onClick={() => onOpen(ticket)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        background: "#fff",
        border: "none",
        borderBottom: "1px solid #f1f5f9",
        padding: "14px 16px",
        cursor: "pointer",
      }}
    >
      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1d4ed8",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {ticket.subject}
        </div>
      </span>
      {showRaisedBy && (
        <span style={{ width: 140, flexShrink: 0, fontSize: 13, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ticket.raisedByName || "—"}
        </span>
      )}
      <span style={{ width: 90, flexShrink: 0, fontSize: 13, color: "#64748b" }}>{ticket.ticketNumber}</span>
      <span style={{ width: 110, flexShrink: 0, fontSize: 13, color: "#64748b" }}>{fmtShortDate(ticket.createdAt)}</span>
      <span style={{ width: 130, flexShrink: 0, fontSize: 13, color: "#64748b" }}>{fmtShortDate(ticket.updatedAt)}</span>
      <span style={{ width: 100, flexShrink: 0, textAlign: "right" }}>
        <Badge palette={statusPalette}>{statusPalette.label}</Badge>
      </span>
    </button>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const SupportCentrePage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const admin = isOrgAdmin(user);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await supportService.listTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openTicket = async (ticket) => {
    try {
      const fresh = await supportService.getTicket(ticket.id);
      setSelected(fresh);
    } catch (err) {
      setSelected(ticket);
    }
  };

  const handleReply = async (id, message, files) => {
    const updated = await supportService.replyToTicket(id, message, files);
    setSelected(updated);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleCreated = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    setShowNew(false);
    setSelected(ticket);
  };

  const filtered = tickets.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "OPEN") return t.status === "OPEN" || t.status === "IN_PROGRESS";
    return t.status === filter;
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 60px" }}>
      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {!selected && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LifeBuoy size={22} color="#2563eb" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
                  Support Centre
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                  {admin
                    ? "Every ticket raised across your organization"
                    : "Your support tickets — replies also work by email"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button style={secondaryBtnStyle} onClick={load} title="Refresh">
                <RefreshCw size={16} />
              </button>
              <button style={primaryBtnStyle} onClick={() => setShowNew(true)}>
                <Plus size={16} /> New Ticket
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { key: "ALL", label: "All" },
              { key: "OPEN", label: "Open" },
              { key: "RESOLVED", label: "Resolved" },
              { key: "CLOSED", label: "Closed" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: `1px solid ${filter === f.key ? "#2563eb" : "#e2e8f0"}`,
                  background: filter === f.key ? "#eff6ff" : "#fff",
                  color: filter === f.key ? "#2563eb" : "#475569",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#b91c1c",
                fontSize: 13,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: "#94a3b8" }}>
              <Loader2 size={22} className="spin" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onNew={() => setShowNew(true)} />
          ) : (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
              <TicketListHeader showRaisedBy={admin} />
              {filtered.map((t) => (
                <TicketRow key={t.id} ticket={t} onOpen={openTicket} showRaisedBy={admin} />
              ))}
            </div>
          )}
        </>
      )}

      {selected && (
        <TicketThread
          ticket={selected}
          isAdmin={admin}
          onBack={() => {
            setSelected(null);
            load();
          }}
          onReply={handleReply}
        />
      )}

      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreated={handleCreated} />}
    </div>
  );
};

export default SupportCentrePage;
