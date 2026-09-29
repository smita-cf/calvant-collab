import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  RefreshCw,
  Save,
  ShieldCheck,
  Calculator,
  SlidersHorizontal,
  Calendar,
  X,
} from "lucide-react";
import { Modal, ModalHeader, Spinner } from "../ui";
import {
  getSessionUser,
  inputStyle,
  selectStyle,
  labelStyle,
  btnPrimary,
} from "../../utils/helpers";
import { useControls } from "../../hooks/useControls";
import auditService from "../../services/auditService";
import { useFramework } from "../../../../context/FrameworkContex";
import { captureActivity, ACTIONS } from "../../../../services/activities";

// ─────────────────────────────────────────────────────────────────────────────
// DATE UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function isWeekend(date) {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
}

function toInputDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayInputDate() {
  return toInputDate(new Date());
}

function addWorkDays(date, n) {
  const d = new Date(date);
  if (n === 0) return d;
  let remaining = Math.abs(n);
  const direction = n > 0 ? 1 : -1;
  while (remaining > 0) {
    d.setDate(d.getDate() + direction);
    if (!isWeekend(d)) remaining--;
  }
  return d;
}

function countWorkDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (start > end) return 0;
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    if (!isWeekend(d)) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function subWorkDays(date, n) {
  return addWorkDays(date, -n);
}

function computeDerivedDates(openingStr, closureStr, stage1Ratio) {
  if (!openingStr || !closureStr) return null;
  const opening = new Date(openingStr);
  const closure = new Date(closureStr);
  const totalWorkDays = countWorkDays(opening, closure);
  if (totalWorkDays < 3) return null;

  let s1Days    = Math.max(1, Math.floor((totalWorkDays * stage1Ratio) / 100));
  let remaining = totalWorkDays - s1Days;
  if (remaining < 2) { s1Days = totalWorkDays - 2; remaining = 2; }
  let s2Days    = Math.max(1, Math.floor(remaining * 0.67));
  let repDays   = Math.max(1, remaining - s2Days);
  while (s1Days + s2Days + repDays > totalWorkDays) {
    if (repDays > 1)     repDays--;
    else if (s2Days > 1) s2Days--;
    else if (s1Days > 1) s1Days--;
    else break;
  }

  const s1Start  = opening;
  const s1End    = addWorkDays(s1Start, s1Days - 1);
  const s2Start  = addWorkDays(s1End, 1);
  const s2End    = addWorkDays(s2Start, s2Days - 1);
  const repStart = addWorkDays(s2End, 1);
  const repEnd   = addWorkDays(repStart, repDays - 1);

  return {
    stage1StartDate:    toInputDate(s1Start),
    stage1EndDate:      toInputDate(s1End),
    stage2StartDate:    toInputDate(s2Start),
    stage2EndDate:      toInputDate(s2End),
    reportingStartDate: toInputDate(repStart),
    reportingEndDate:   toInputDate(repEnd),
    stage1Days: s1Days, stage2Days: s2Days, reportingDays: repDays, totalWorkDays,
  };
}

function computeRatioFromDates(openingStr, closureStr, s1StartStr, s1EndStr) {
  if (!openingStr || !closureStr || !s1StartStr || !s1EndStr) return null;
  const totalWorkDays = countWorkDays(new Date(openingStr), new Date(closureStr));
  if (totalWorkDays < 3) return null;
  const s1Days = countWorkDays(new Date(s1StartStr), new Date(s1EndStr));
  if (s1Days < 1) return null;
  const ratio = Math.round((s1Days / totalWorkDays) * 100);
  return Math.min(90, Math.max(10, ratio));
}

function computeMaxDates(closureStr) {
  if (!closureStr) return {};
  const closure = new Date(closureStr);
  return {
    s1EndMax:    toInputDate(subWorkDays(closure, 2)),
    s2EndMax:    toInputDate(subWorkDays(closure, 1)),
    repEndMax:   toInputDate(closure),
    s1StartMax:  toInputDate(subWorkDays(closure, 2)),
    s2StartMax:  toInputDate(subWorkDays(closure, 1)),
    repStartMax: toInputDate(closure),
  };
}

function cascadeForward(field, newValue, form) {
  const opening = form.openingMeetingDate;
  const closure = form.closureMeetingDate;
  if (!opening || !closure) return null;

  const closureDate = new Date(closure);
  const mx = computeMaxDates(closure);

  let corrected = newValue;
  if (field === "stage1EndDate"    && mx.s1EndMax  && new Date(newValue) > new Date(mx.s1EndMax))  corrected = mx.s1EndMax;
  if (field === "stage2EndDate"    && mx.s2EndMax  && new Date(newValue) > new Date(mx.s2EndMax))  corrected = mx.s2EndMax;
  if (field === "reportingEndDate" && new Date(newValue) > closureDate) corrected = toInputDate(closureDate);

  const s2Duration  = (form.stage2StartDate  && form.stage2EndDate)
    ? Math.max(1, countWorkDays(new Date(form.stage2StartDate),  new Date(form.stage2EndDate)))  : 1;
  const repDuration = (form.reportingStartDate && form.reportingEndDate)
    ? Math.max(1, countWorkDays(new Date(form.reportingStartDate), new Date(form.reportingEndDate))) : 1;

  let s1s = form.stage1StartDate,  s1e = form.stage1EndDate;
  let s2s = form.stage2StartDate,  s2e = form.stage2EndDate;
  let rs  = form.reportingStartDate, re = form.reportingEndDate;

  switch (field) {
    case "stage1StartDate":    s1s = corrected; break;
    case "stage1EndDate":      s1e = corrected; break;
    case "stage2StartDate":    s2s = corrected; break;
    case "stage2EndDate":      s2e = corrected; break;
    case "reportingStartDate": rs  = corrected; break;
    case "reportingEndDate":   re  = corrected; break;
    default: break;
  }
  
  if (field === "stage1StartDate" || field === "stage1EndDate") {
    if (s1e) {
      const newS2s  = addWorkDays(new Date(s1e), 1);
      const s2sDate = mx.s2StartMax && newS2s > new Date(mx.s2StartMax) ? new Date(mx.s2StartMax) : newS2s;
      s2s = toInputDate(s2sDate);
      const newS2e  = addWorkDays(s2sDate, s2Duration - 1);
      const s2eDate = mx.s2EndMax && newS2e > new Date(mx.s2EndMax) ? new Date(mx.s2EndMax) : newS2e;
      s2e = toInputDate(s2eDate);
      const newRs   = addWorkDays(s2eDate, 1);
      const rsDate  = newRs > closureDate ? closureDate : newRs;
      rs = toInputDate(rsDate);
      const newRe   = addWorkDays(rsDate, repDuration - 1);
      re = toInputDate(newRe > closureDate ? closureDate : newRe);
    }
  }

  if (field === "stage2StartDate" || field === "stage2EndDate") {
    if (s2e) {
      const newRs  = addWorkDays(new Date(s2e), 1);
      const rsDate = newRs > closureDate ? closureDate : newRs;
      rs = toInputDate(rsDate);
      const newRe  = addWorkDays(rsDate, repDuration - 1);
      re = toInputDate(newRe > closureDate ? closureDate : newRe);
    }
  }

  if (field === "reportingEndDate") {
    if (re && new Date(re) > closureDate) re = toInputDate(closureDate);
  }

  const newRatio = (field === "stage1StartDate" || field === "stage1EndDate")
    ? computeRatioFromDates(opening, closure, s1s, s1e) : null;

  return {
    stage1StartDate: s1s, stage1EndDate: s1e,
    stage2StartDate: s2s, stage2EndDate: s2e,
    reportingStartDate: rs, reportingEndDate: re,
    newRatio,
  };
}

function validatePhaseDates(form) {
  const errors = [];
  const {
    openingMeetingDate: op, closureMeetingDate: cl,
    stage1StartDate: s1s, stage1EndDate: s1e,
    stage2StartDate: s2s, stage2EndDate: s2e,
    reportingStartDate: rs, reportingEndDate: re,
  } = form;
  if (!op || !cl) return errors;
  if (isWeekend(op)) errors.push("Opening Meeting Date must be a working day (Mon–Fri).");
  if (isWeekend(cl)) errors.push("Closure Meeting Date must be a working day (Mon–Fri).");
  const totalWD = countWorkDays(new Date(op), new Date(cl));
  if (totalWD < 3) { errors.push("Opening and Closure dates must have at least 3 working days between them."); return errors; }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (new Date(op) < today) errors.push("Opening Meeting Date cannot be in the past.");
  if (s1s && s1e && countWorkDays(new Date(s1s), new Date(s1e)) < 1) errors.push("Stage 1 must have at least 1 working day.");
  if (s2s && s2e && countWorkDays(new Date(s2s), new Date(s2e)) < 1) errors.push("Stage 2 must have at least 1 working day.");
  if (rs  && re  && countWorkDays(new Date(rs),  new Date(re))  < 1) errors.push("Reporting must have at least 1 working day.");
  const mx = computeMaxDates(cl);
  if (s1e && mx.s1EndMax && new Date(s1e) > new Date(mx.s1EndMax)) errors.push("Stage 1 end must leave at least 2 working days for Stage 2 and Reporting.");
  if (s2e && mx.s2EndMax && new Date(s2e) > new Date(mx.s2EndMax)) errors.push("Stage 2 end must leave at least 1 working day for Reporting.");
  if (re  && new Date(re) > new Date(cl)) errors.push("Reporting end cannot be after the Closure Meeting date.");
  if (s1s && op  && new Date(s1s) < new Date(op))  errors.push("Stage 1 start cannot be before the Opening Meeting date.");
  if (s1e && s1s && new Date(s1e) < new Date(s1s)) errors.push("Stage 1 end must be on or after Stage 1 start.");
  if (s2s && s1e && new Date(s2s) <= new Date(s1e)) errors.push("Stage 2 start must be after Stage 1 end.");
  if (s2e && s2s && new Date(s2e) < new Date(s2s)) errors.push("Stage 2 end must be on or after Stage 2 start.");
  if (rs  && s2e && new Date(rs)  <= new Date(s2e)) errors.push("Reporting start must be after Stage 2 end.");
  if (re  && rs  && new Date(re)  < new Date(rs))   errors.push("Reporting end must be on or after Reporting start.");
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKDAY DATE PICKER
// ─────────────────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_HEADERS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function WorkdayDatePicker({ value, onChange, minDate, maxDate }) {
  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState(null);
  const [viewMonth, setViewMonth] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const base = value ? new Date(value) : new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (viewYear === null) return null;

  const selectedDate = value ? new Date(value) : null;
  const minD = minDate ? new Date(minDate) : null;
  const maxD = maxDate ? new Date(maxDate) : null;
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function isDisabled(day) {
    if (!day) return true;
    const d = new Date(viewYear, viewMonth, day);
    if (isWeekend(d)) return true;
    if (minD) { const mn = new Date(minD.getFullYear(), minD.getMonth(), minD.getDate()); if (d < mn) return true; }
    if (maxD) { const mx = new Date(maxD.getFullYear(), maxD.getMonth(), maxD.getDate()); if (d > mx) return true; }
    return false;
  }
  function isWeekendDay(day) { return day ? isWeekend(new Date(viewYear, viewMonth, day)) : false; }
  function isSelected(day) {
    if (!day || !selectedDate) return false;
    return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
  }
  function isToday(day) {
    if (!day) return false;
    const t = new Date();
    return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === day;
  }
  function handleDayClick(day) {
    if (!day || isDisabled(day)) return;
    onChange(toInputDate(new Date(viewYear, viewMonth, day)));
    setOpen(false);
  }

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none", minHeight: 38, paddingRight: 10 }}
      >
        <span style={{ color: displayValue ? "#1e293b" : "#94a3b8", fontSize: 13 }}>{displayValue || "Select date…"}</span>
        <Calendar size={14} color="#94a3b8" style={{ flexShrink: 0, marginLeft: 6 }} />
      </div>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.13)", padding: "14px 16px 16px", width: 276 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <button type="button" onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }}>
              <ChevronLeft size={15} color="#475569" />
            </button>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }}>
              <ChevronRight size={15} color="#475569" />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", borderRadius: 8, padding: "5px 10px", marginBottom: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#e2e8f0", border: "1px solid #cbd5e1", flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>Weekends (Sat &amp; Sun) are unavailable for audit scheduling</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
            {DAY_HEADERS.map((h, i) => (
              <div key={h} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, padding: "2px 0", color: (i === 0 || i === 6) ? "#d1d5db" : "#64748b" }}>{h}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {cells.map((day, idx) => {
              const weekend  = isWeekendDay(day);
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const today    = isToday(day);
              let bg = "transparent", color = "#1e293b", cursor = day ? "pointer" : "default", fontW = 400, border = "1.5px solid transparent";
              if (!day) { /* empty */ }
              else if (selected) { bg = "#2563eb"; color = "#fff"; fontW = 700; }
              else if (weekend)  { bg = "#f1f5f9"; color = "#c4c9d4"; cursor = "not-allowed"; }
              else if (disabled) { color = "#cbd5e1"; cursor = "not-allowed"; }
              else if (today)    { border = "1.5px solid #2563eb"; color = "#2563eb"; fontW = 600; }
              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  title={weekend ? "Weekends are excluded from audit scheduling" : disabled && day ? "Date not available for this field" : undefined}
                  style={{ textAlign: "center", padding: "5px 0", borderRadius: 7, fontSize: 12, fontWeight: fontW, background: bg, color, cursor, border, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.12s", ...(weekend && day ? { backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)" } : {}) }}
                  onMouseEnter={e => { if (!disabled && !selected && !weekend && day) e.currentTarget.style.background = "#eff6ff"; }}
                  onMouseLeave={e => { if (!disabled && !selected && !weekend && day) e.currentTarget.style.background = "transparent"; }}
                >
                  {day || ""}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { bg: "#2563eb", border: "none", label: "Selected" },
              { bg: "#f1f5f9", border: "1px solid #e2e8f0", label: "Weekend (unavailable)" },
              { bg: "transparent", border: "1.5px solid #2563eb", label: "Today" },
            ].map(({ bg, border: b, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: b, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#64748b" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE FILTER BANNER — fully dynamic
// ─────────────────────────────────────────────────────────────────────────────
function ActiveFilterBanner({ allowedFrameworks, isAllSelected }) {
  return (
    <div
      className="flex items-center gap-2 flex-wrap px-3.5 py-2.5 rounded-xl border mb-0"
      style={{ background: isAllSelected ? "#f0f4ff" : "#fffbeb", borderColor: isAllSelected ? "#c7d2fe" : "#fcd34d" }}
    >
      <ShieldCheck size={13} color={isAllSelected ? "#4338ca" : "#b45309"} className="flex-shrink-0" />
      <span className="text-xs font-bold" style={{ color: isAllSelected ? "#4338ca" : "#b45309" }}>
        Global Filter Active:
      </span>
      {isAllSelected ? (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
          All Frameworks
        </span>
      ) : (
        allowedFrameworks.map(fw => (
          <span
            key={fw.code}
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: fw.color + "18", color: fw.color, border: `1px solid ${fw.color}55` }}
          >
            {fw.label}
          </span>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RATIO CONTROL
// ─────────────────────────────────────────────────────────────────────────────
function RatioControl({ stage1Ratio, onChange, form }) {
  const stage2Ratio = 100 - stage1Ratio;
  const s1Days  = (form.stage1StartDate   && form.stage1EndDate)    ? Math.max(0, countWorkDays(new Date(form.stage1StartDate),   new Date(form.stage1EndDate)))    : 0;
  const s2Days  = (form.stage2StartDate   && form.stage2EndDate)    ? Math.max(0, countWorkDays(new Date(form.stage2StartDate),   new Date(form.stage2EndDate)))    : 0;
  const repDays = (form.reportingStartDate && form.reportingEndDate) ? Math.max(0, countWorkDays(new Date(form.reportingStartDate), new Date(form.reportingEndDate))) : 0;
  const totalWorkDays = (form.openingMeetingDate && form.closureMeetingDate)
    ? countWorkDays(new Date(form.openingMeetingDate), new Date(form.closureMeetingDate)) : 0;
  const canShow    = totalWorkDays >= 3;
  const hasPhases  = s1Days > 0 || s2Days > 0 || repDays > 0;
  const totalShown = s1Days + s2Days + repDays;
  const s1Flex   = totalShown > 0 ? s1Days  : stage1Ratio;
  const s2Flex   = totalShown > 0 ? s2Days  : Math.round(stage2Ratio * 0.67);
  const repFlex  = totalShown > 0 ? repDays : Math.round(stage2Ratio * 0.33);

  return (
    <div style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", border: "1px solid #bae6fd", borderRadius: 14, padding: "16px 18px", marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <SlidersHorizontal size={14} color="#0369a1" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#0369a1" }}>Phase Ratio Control</span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "#0369a1", color: "#fff", padding: "2px 10px", borderRadius: 20 }}>
          {stage1Ratio}% : {stage2Ratio}%
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#0369a1" }}>Stage 1 / Documentation</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed" }}>Stage 2 + Reporting</span>
      </div>
      <input
        type="range" min={10} max={90} step={1} value={stage1Ratio}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#0369a1", cursor: "pointer", marginBottom: 10 }}
      />
      <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", gap: 2 }}>
        <div style={{ flex: s1Flex, background: "linear-gradient(90deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", minWidth: 0, transition: "flex 0.3s" }}>
          {canShow && hasPhases ? `${s1Days}d` : "Stage 1"}
        </div>
        <div style={{ flex: s2Flex, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", minWidth: 0, transition: "flex 0.3s" }}>
          {canShow && hasPhases ? `${s2Days}d` : "Stage 2"}
        </div>
        <div style={{ flex: repFlex, background: "linear-gradient(90deg,#06b6d4,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", minWidth: 0, transition: "flex 0.3s" }}>
          {canShow && hasPhases ? `${repDays}d` : "Report"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        {[
          { color: "#2563eb", label: "Stage 1 (Documentation)" },
          { color: "#7c3aed", label: "Stage 2 (Practice)" },
          { color: "#0891b2", label: "Reporting" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#475569" }}>{label}</span>
          </div>
        ))}
      </div>
      {canShow && (
        <p style={{ margin: "8px 0 0", fontSize: 10, color: "#0369a1", fontStyle: "italic" }}>
          Day counts are working days only (Mon–Fri). Both start and end days are counted.
        </p>
      )}
      {!canShow && form.openingMeetingDate && form.closureMeetingDate && (
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#dc2626" }}>
          ⚠ Opening and Closure dates must have at least 3 working days between them.
        </p>
      )}
      {(!form.openingMeetingDate || !form.closureMeetingDate) && (
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#64748b" }}>
          Set Opening and Closure dates to enable phase auto-calculation.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE DATE ROW
// ─────────────────────────────────────────────────────────────────────────────
function PhaseDateRow({ label, fieldKey, value, onChange, minDate, maxDate, accent }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: accent || "#475569", display: "block", marginBottom: 4 }}>{label}</label>
      <WorkdayDatePicker value={value} onChange={v => onChange(fieldKey, v)} minDate={minDate} maxDate={maxDate} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function PlanAuditModal(props) {
  const { onClose, onSaved, auditors } = props;
  const sessionUser = getSessionUser();

  useEffect(() => {
    captureActivity({
      action: ACTIONS.CLICK,
      item: [{ detail: "Audit · Opened 'Plan Audit' modal" }],
      url: "/gap-assessment",
    });
  }, []);

  // ── Framework context — dynamic ───────────────────────────────────────────
  const { selectedFrameworks, isAllSelected, availableFrameworks } = useFramework();

  // Map label → code (e.g. "ISO 27001" → "ISO27001")
  const fwLabelToCode = useMemo(
    () => Object.fromEntries(availableFrameworks.map(fw => [fw.id, fw.code])),
    [availableFrameworks],
  );

  // Frameworks the user has enabled, as rich objects
  const allowedFrameworks = useMemo(() => {
    if (isAllSelected) return availableFrameworks;
    return selectedFrameworks
      .map(label => availableFrameworks.find(fw => fw.id === label))
      .filter(Boolean);
  }, [selectedFrameworks, isAllSelected, availableFrameworks]);

  const allowedCodes = useMemo(() => allowedFrameworks.map(fw => fw.code), [allowedFrameworks]);

  const defaultCode = allowedCodes.length > 0 ? allowedCodes[0] : (availableFrameworks[0]?.code || "ISO27001");

  const [stage1Ratio, setStage1Ratio] = useState(33);
  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const [form, setForm] = useState({
    auditType: "", frameworkCode: defaultCode, soc2Type: "", soc2Criteria: "",
    leadAuditor: "", openingMeetingDate: "",
    stage1StartDate: "", stage1EndDate: "",
    stage2StartDate: "", stage2EndDate: "",
    reportingStartDate: "", reportingEndDate: "",
    closureMeetingDate: "", poc: "", controls: [],
  });

  // ── Anchor date handler ───────────────────────────────────────────────────
  const handleAnchorDateChange = useCallback((field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "openingMeetingDate" && prev.closureMeetingDate) {
        const minClosure = addWorkDays(new Date(value), 2);
        if (new Date(prev.closureMeetingDate) < minClosure) updated.closureMeetingDate = toInputDate(minClosure);
      }
      const openingToUse = field === "openingMeetingDate" ? value : updated.openingMeetingDate;
      const closureToUse = field === "closureMeetingDate" ? value : updated.closureMeetingDate;
      const derived = computeDerivedDates(openingToUse, closureToUse, stage1Ratio);
      if (!derived) return updated;
      return {
        ...updated,
        stage1StartDate:    derived.stage1StartDate,
        stage1EndDate:      derived.stage1EndDate,
        stage2StartDate:    derived.stage2StartDate,
        stage2EndDate:      derived.stage2EndDate,
        reportingStartDate: derived.reportingStartDate,
        reportingEndDate:   derived.reportingEndDate,
      };
    });
  }, [stage1Ratio]);

  const handleRatioChange = useCallback((newRatio) => {
    setStage1Ratio(newRatio);
    setForm(prev => {
      const derived = computeDerivedDates(prev.openingMeetingDate, prev.closureMeetingDate, newRatio);
      if (!derived) return prev;
      return {
        ...prev,
        stage1StartDate:    derived.stage1StartDate,
        stage1EndDate:      derived.stage1EndDate,
        stage2StartDate:    derived.stage2StartDate,
        stage2EndDate:      derived.stage2EndDate,
        reportingStartDate: derived.reportingStartDate,
        reportingEndDate:   derived.reportingEndDate,
      };
    });
  }, []);

  const handlePhaseDateChange = useCallback((field, value) => {
    setForm(prev => {
      const result = cascadeForward(field, value, prev);
      if (!result) return { ...prev, [field]: value };
      if (result.newRatio !== null && result.newRatio !== undefined) setStage1Ratio(result.newRatio);
      return {
        ...prev,
        stage1StartDate:    result.stage1StartDate,
        stage1EndDate:      result.stage1EndDate,
        stage2StartDate:    result.stage2StartDate,
        stage2EndDate:      result.stage2EndDate,
        reportingStartDate: result.reportingStartDate,
        reportingEndDate:   result.reportingEndDate,
      };
    });
  }, []);

  // Reset framework if it becomes disallowed
  useEffect(() => {
    if (allowedCodes.length > 0 && !allowedCodes.includes(form.frameworkCode)) {
      setForm(p => ({ ...p, frameworkCode: defaultCode }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedCodes, defaultCode]);

  const { controls: apiControls, loading: ctrlLoading, error: ctrlError } = useControls(form.frameworkCode);

  useEffect(() => {
    if (form.frameworkCode !== "SOC2") setForm(prev => ({ ...prev, soc2Type: "", soc2Criteria: "" }));
  }, [form.frameworkCode]);

  useEffect(() => {
    if (!apiControls || apiControls.length === 0) return;
    setForm(prev => {
      const merged = apiControls.map(c => {
        const existing = prev.controls.find(x => x.controlId === c.controlId);
        return { controlId: c.controlId, assignedTo: existing ? existing.assignedTo : "" };
      });
      return { ...prev, controls: merged };
    });
  }, [apiControls]);

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  // Phase date min/max constraints
  const openingMinDate = todayInputDate();
  const closureMinDate = form.openingMeetingDate
    ? toInputDate(addWorkDays(new Date(form.openingMeetingDate), 2))
    : openingMinDate;
  const s1StartMin  = form.openingMeetingDate || openingMinDate;
  const s2StartMin  = form.stage1EndDate  ? toInputDate(addWorkDays(new Date(form.stage1EndDate),  1)) : undefined;
  const repStartMin = form.stage2EndDate  ? toInputDate(addWorkDays(new Date(form.stage2EndDate),  1)) : undefined;
  const mx = computeMaxDates(form.closureMeetingDate);

  // Validation
  const allDatesFilled =
    form.auditType && form.leadAuditor && form.poc &&
    form.openingMeetingDate && form.stage1StartDate && form.stage1EndDate &&
    form.stage2StartDate    && form.stage2EndDate    &&
    form.reportingStartDate && form.reportingEndDate && form.closureMeetingDate;

  const isSoc2 = form.frameworkCode === "SOC2";
  const soc2SelectionsFilled = !isSoc2 || (!!form.soc2Type && !!form.soc2Criteria);
  const dateErrors = allDatesFilled ? validatePhaseDates(form) : [];
  const canNext    = allDatesFilled && dateErrors.length === 0 && soc2SelectionsFilled;

  // Auditor helpers
  function eligibleAuditors(controlId, controlsList) {
    const list = controlsList || apiControls;
    const ctrl = list.find(c => c.controlId === controlId);
    if (!ctrl || !ctrl.departmentIds || ctrl.departmentIds.length === 0) return auditors;
    const controlDeptIds = ctrl.departmentIds.map(id => String(id));
    return auditors.filter(a => {
      let userDeptIds = [];
      if (Array.isArray(a.departments))
        userDeptIds = a.departments.map(d => String(typeof d === "object" ? d._id || d.id || "" : d));
      else if (Array.isArray(a.departmentIds))
        userDeptIds = a.departmentIds.map(id => String(id));
      else if (a.department)
        userDeptIds = [String(typeof a.department === "object" ? a.department._id || a.department.id : a.department)];
      return !userDeptIds.some(uid => controlDeptIds.includes(uid));
    });
  }

  function setAssignee(controlId, assignedTo) {
    setForm(prev => ({ ...prev, controls: prev.controls.map(c => c.controlId === controlId ? { ...c, assignedTo } : c) }));
  }
  function assignSection(categoryControlIds, auditorId) {
    if (!auditorId) return;
    setForm(prev => ({
      ...prev,
      controls: prev.controls.map(c => {
        if (!categoryControlIds.includes(c.controlId)) return c;
        const eligible = eligibleAuditors(c.controlId, apiControls);
        return eligible.some(a => String(a._id || a.id) === String(auditorId)) ? { ...c, assignedTo: auditorId } : c;
      }),
    }));
  }
  function assignClause(clauseControlIds, auditorId) {
    if (!auditorId) return;
    setForm(prev => ({
      ...prev,
      controls: prev.controls.map(c => {
        if (!clauseControlIds.includes(c.controlId)) return c;
        const eligible = eligibleAuditors(c.controlId, apiControls);
        return eligible.some(a => String(a._id || a.id) === String(auditorId)) ? { ...c, assignedTo: auditorId } : c;
      }),
    }));
  }

  // Save handler
  function handleSave() {
    setSaving(true); setError("");
    const payload = {
      auditType: form.auditType,
      frameworkCode: form.frameworkCode,
      organization: sessionUser.organization || "",
      createdBy: sessionUser.id || sessionUser._id || "",
      leadAuditor: form.leadAuditor,
      poc: form.poc,
      openingMeetingDate:  form.openingMeetingDate,
      stage1StartDate:     form.stage1StartDate,
      stage1EndDate:       form.stage1EndDate,
      stage2StartDate:     form.stage2StartDate,
      stage2EndDate:       form.stage2EndDate,
      reportingStartDate:  form.reportingStartDate,
      reportingEndDate:    form.reportingEndDate,
      closureMeetingDate:  form.closureMeetingDate,
      status: "IN_PROGRESS",
      controls: form.controls.filter(c => c.assignedTo),
      findings: [],
      ...(isSoc2 && { soc2Type: form.soc2Type, soc2Criteria: form.soc2Criteria }),
    };
    auditService.createAudit(payload)
      .then(() => {
        captureActivity({
          action: ACTIONS.CREATE,
          item: [{ detail: "Audit · Planned new audit", auditType: payload.auditType, framework: payload.frameworkCode }],
          url: "/gap-assessment",
        });
        onSaved();
        onClose();
      })
      .catch(err => {
        setError(err.message || "Failed to create audit");
        setSaving(false);
      });
  }

  // Group / sort helpers
  function getCategoryOrder(frameworkCode, category) {
    if (frameworkCode === "SOC2") {
      const O = ["Common Criteria","Confidentiality","Availability","Process Integrity","Privacy"];
      const i = O.indexOf(category); return i === -1 ? 99 : i;
    }
    const O = [
      "ISMS Core","PIMS Core","AIMS Core","AI Policies","AI Organisation","AI Resources",
      "AI Impact Assessment","AI System Life Cycle","AI Data","AI Information & Transparency",
      "AI Use","AI Third-Party & Customer","Organizational Controls","People Controls",
      "Physical Controls","Technological Controls","PIMS Controller Controls",
      "PIMS Processor Controls","Annex A","Annex B",
    ];
    const i = O.indexOf(category); return i === -1 ? 50 : i;
  }
  function sortClauses(a, b) {
    function normalize(v) {
      if (!v) return [999];
      return v.replace(/^[A-Z]\./, "").split(".").map(n => parseInt(n, 10) || 0);
    }
    const pa = normalize(a), pb = normalize(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) { const na = pa[i] || 0, nb = pb[i] || 0; if (na !== nb) return na - nb; }
    return 0;
  }
  function groupControls(controls) {
    const grouped = {};
    controls.forEach(ctrl => {
      const category     = ctrl.category || ctrl.sectionType || "Other";
      const clausePrefix = (ctrl.clause || "").split(".").slice(0, 1).join(".") || "Other";
      if (!grouped[category]) grouped[category] = {};
      if (!grouped[category][clausePrefix]) grouped[category][clausePrefix] = [];
      grouped[category][clausePrefix].push(ctrl);
    });
    return grouped;
  }

  const [expanded, setExpanded] = useState({});
  function toggleSection(key) { setExpanded(prev => ({ ...prev, [key]: !prev[key] })); }

  const allControlsAssigned = form.controls.length > 0 && form.controls.every(c => c.assignedTo);

  const phaseLabel = {
    fontSize: 11, fontWeight: 700, color: "#475569",
    textTransform: "uppercase", letterSpacing: "0.05em",
    marginBottom: 8, marginTop: 4,
  };
  const pillBase = {
    fontSize: 12, fontWeight: 600, padding: "6px 14px",
    borderRadius: 20, border: "1.5px solid", cursor: "pointer", transition: "all 0.15s",
  };
  function pillStyle(active, color) {
    return {
      ...pillBase,
      ...(active
        ? { background: color, borderColor: color, color: "#fff" }
        : { background: "#f8fafc", borderColor: "#cbd5e1", color: "#64748b" }),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Modal onClose={onClose} wide={true}>

      {/* FIXED HEADER */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Plan Audit</h2>
              <p className="text-xs text-slate-500">
                Step {step} of 2 — {step === 1 ? "Audit Details" : "Assign Controls"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="px-7 pt-4 pb-3">
          <ActiveFilterBanner allowedFrameworks={allowedFrameworks} isAllSelected={isAllSelected} />
        </div>

        <div className="flex gap-2 px-7 pb-4">
          {[
            { s: 1, label: "Audit Details"   },
            { s: 2, label: "Assign Controls" },
          ].map(({ s, label }) => {
            const isActive = step === s;
            const isLocked = s === 2 && !canNext;
            return (
              <button
                key={s}
                onClick={() => { if (!isLocked) setStep(s); }}
                disabled={isLocked}
                title={isLocked ? "Complete Audit Details first" : undefined}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${isActive  ? "bg-indigo-600 text-white" : ""}
                  ${!isActive && !isLocked ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : ""}
                  ${isLocked  ? "bg-slate-50 text-slate-300 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0
                  ${isActive  ? "bg-white text-indigo-600"  : ""}
                  ${!isActive && !isLocked ? "bg-slate-300 text-white" : ""}
                  ${isLocked  ? "bg-slate-200 text-slate-400" : ""}`}>
                  {s}
                </span>
                {label}
                {isLocked && <span className="text-xs opacity-60">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* SCROLLABLE FORM CONTENT */}
      <div
        className="flex-1 overflow-y-auto px-7 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >

        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-4 py-2">

            {/* Audit Type */}
            <div>
              <label style={labelStyle}>Audit Type</label>
              <div style={{ position: "relative" }}>
                <select value={form.auditType} onChange={e => setField("auditType", e.target.value)} style={selectStyle}>
                  <option value="">Select type...</option>
                  {["Internal","External","Certification","Surveillance"].map(t => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
              </div>
            </div>

            {/* Framework — fully dynamic */}
            <div>
              <label style={labelStyle}>Framework</label>
              {allowedFrameworks.length === 0 ? (
                <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#991b1b" }}>
                  ⚠ No frameworks currently enabled. Please update the filter from the navbar.
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <select value={form.frameworkCode} onChange={e => setField("frameworkCode", e.target.value)} style={selectStyle}>
                    {allowedFrameworks.map(fw => (
                      <option key={fw.code} value={fw.code}>{fw.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                </div>
              )}
            </div>

            {/* SOC 2 sub-options */}
            {isSoc2 && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ ...labelStyle, color: "#1d4ed8", marginBottom: 8, display: "block" }}>SOC 2 Type</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { value: "Type1", label: "Type 1", desc: "Design only",        color: "#7c3aed" },
                      { value: "Type2", label: "Type 2", desc: "Design + Practice",  color: "#0891b2" },
                    ].map(opt => {
                      const active = form.soc2Type === opt.value;
                      return (
                        <button key={opt.value} type="button" onClick={() => setField("soc2Type", opt.value)}
                          style={{ ...pillStyle(active, opt.color), display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 16px", borderRadius: 10, flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</span>
                          <span style={{ fontSize: 10, fontWeight: 400, opacity: active ? 0.85 : 0.6 }}>{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                  {form.soc2Type && (
                    <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
                      {form.soc2Type === "Type1" && "⚠ Type 1 — Practice evidence columns will be greyed out in the assessment."}
                      {form.soc2Type === "Type2" && "Full Audit"}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ ...labelStyle, color: "#1d4ed8", marginBottom: 8, display: "block" }}>Trust Service Criteria</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { value: "3", label: "3 Criteria", desc: "All except Privacy",          color: "#0f766e" },
                      { value: "5", label: "5 Criteria", desc: "All criteria incl. Privacy",  color: "#b45309" },
                    ].map(opt => {
                      const active = form.soc2Criteria === opt.value;
                      return (
                        <button key={opt.value} type="button" onClick={() => setField("soc2Criteria", opt.value)}
                          style={{ ...pillStyle(active, opt.color), display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 20px", borderRadius: 10, flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</span>
                          <span style={{ fontSize: 10, fontWeight: 400, opacity: active ? 0.85 : 0.6 }}>{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {(!form.soc2Type || !form.soc2Criteria) && (
                  <p style={{ fontSize: 11, color: "#dc2626", margin: 0 }}>⚠ Please select both SOC 2 Type and Criteria to continue.</p>
                )}
              </div>
            )}

            {/* Lead Auditor */}
            <div>
              <label style={labelStyle}>Lead Auditor</label>
              <div style={{ position: "relative" }}>
                <select value={form.leadAuditor} onChange={e => setField("leadAuditor", e.target.value)} style={selectStyle}>
                  <option value="">Select lead auditor...</option>
                  {auditors.map(a => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
                </select>
                <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
              </div>
            </div>

            {/* Point of Contact */}
            <div>
              <label style={labelStyle}>Point of Contact</label>
              <div style={{ position: "relative" }}>
                <select value={form.poc} onChange={e => setField("poc", e.target.value)} style={selectStyle}>
                  <option value="">Select contact...</option>
                  {auditors.map(a => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
                </select>
                <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0" }} />

            {/* Anchor Dates */}
            <div>
              <p style={{ ...phaseLabel, color: "#334155" }}>Audit Anchor Dates</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Opening Meeting Date</label>
                  <WorkdayDatePicker
                    value={form.openingMeetingDate}
                    onChange={v => handleAnchorDateChange("openingMeetingDate", v)}
                    minDate={openingMinDate}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Closure Meeting Date</label>
                  <WorkdayDatePicker
                    value={form.closureMeetingDate}
                    onChange={v => handleAnchorDateChange("closureMeetingDate", v)}
                    minDate={closureMinDate}
                  />
                </div>
              </div>
              {form.openingMeetingDate && !form.closureMeetingDate && (
                <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
                  💡 Select a Closure date to auto-calculate all phase dates.
                </p>
              )}
            </div>

            <RatioControl stage1Ratio={stage1Ratio} onChange={handleRatioChange} form={form} />

            {/* Phase Dates */}
            <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                <Calculator size={13} color="#64748b" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Phase Dates — Auto-calculated · Editable
                </span>
              </div>

              <div style={{ marginBottom: 18 }}>
                <p style={{ ...phaseLabel, color: "#1d4ed8" }}>Stage 1 / Documentation Audit</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <PhaseDateRow label="Start Date" fieldKey="stage1StartDate" value={form.stage1StartDate} onChange={handlePhaseDateChange} minDate={s1StartMin} maxDate={mx.s1StartMax} accent="#1d4ed8" />
                  <PhaseDateRow label="End Date"   fieldKey="stage1EndDate"   value={form.stage1EndDate}   onChange={handlePhaseDateChange} minDate={form.stage1StartDate || s1StartMin} maxDate={mx.s1EndMax} accent="#1d4ed8" />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <p style={{ ...phaseLabel, color: "#6d28d9" }}>Stage 2 / Practice Audit</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <PhaseDateRow label="Start Date" fieldKey="stage2StartDate" value={form.stage2StartDate} onChange={handlePhaseDateChange} minDate={s2StartMin} maxDate={mx.s2StartMax} accent="#6d28d9" />
                  <PhaseDateRow label="End Date"   fieldKey="stage2EndDate"   value={form.stage2EndDate}   onChange={handlePhaseDateChange} minDate={form.stage2StartDate || s2StartMin} maxDate={mx.s2EndMax} accent="#6d28d9" />
                </div>
              </div>

              <div>
                <p style={{ ...phaseLabel, color: "#0369a1" }}>Audit Reporting</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <PhaseDateRow label="Start Date" fieldKey="reportingStartDate" value={form.reportingStartDate} onChange={handlePhaseDateChange} minDate={repStartMin} maxDate={mx.repStartMax} accent="#0369a1" />
                  <PhaseDateRow label="End Date"   fieldKey="reportingEndDate"   value={form.reportingEndDate}   onChange={handlePhaseDateChange} minDate={form.reportingStartDate || repStartMin} maxDate={mx.repEndMax} accent="#0369a1" />
                </div>
              </div>

              <p style={{ margin: "12px 0 0", fontSize: 10, color: "#94a3b8" }}>
                💡 Phase dates auto-fill from the ratio slider and anchor dates. Edit any date manually — the ratio bar and later phases update instantly to stay in sync.
              </p>
            </div>

            {dateErrors.length > 0 && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex flex-col gap-1">
                {dateErrors.map((msg, i) => <span key={i}>• {msg}</span>)}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="py-2">
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3.5 py-2.5 mb-4">
              <Layers size={14} color="#3b82f6" />
              <p className="m-0 text-xs font-semibold text-blue-700">
                Assign auditors to each control. Auditors must be outside the control's department.
              </p>
            </div>

            {isSoc2 && (
              <div className="flex gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  {form.soc2Type === "Type1" ? "Type 1" : "Type 2"}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {form.soc2Criteria === "3" ? "3 Criteria" : "5 Criteria"}
                </span>
              </div>
            )}

            {ctrlLoading && <Spinner />}
            {ctrlError && <p className="text-red-600 text-sm mb-2">Could not load controls: {ctrlError}</p>}

            <div className="flex flex-col gap-2.5">
              {(() => {
                let visibleControls = apiControls || [];
                if (isSoc2 && form.soc2Criteria === "3") {
                  visibleControls = visibleControls.filter(c => (c.category || c.sectionType || "") !== "Privacy");
                }
                const grouped = groupControls(visibleControls);
                return Object.keys(grouped)
                  .sort((a, b) => getCategoryOrder(form.frameworkCode, a) - getCategoryOrder(form.frameworkCode, b))
                  .map(category => {
                    const catControlIds = [];
                    Object.keys(grouped[category]).forEach(pfx =>
                      grouped[category][pfx].forEach(c => catControlIds.push(c.controlId))
                    );
                    const assignedCount = catControlIds.filter(id => {
                      const f = form.controls.find(c => c.controlId === id);
                      return f && f.assignedTo;
                    }).length;
                    const sectionEligibleMap = {};
                    catControlIds.forEach(id =>
                      eligibleAuditors(id, apiControls).forEach(a => { sectionEligibleMap[String(a._id || a.id)] = a; })
                    );
                    const sectionEligible = Object.values(sectionEligibleMap);

                    return (
                      <div key={category} className="mb-4">
                        <div
                          className="flex items-center justify-between px-3.5 py-2.5 bg-slate-200 gap-2.5"
                          style={{ borderRadius: expanded[category] ? "10px 10px 0 0" : 10 }}
                        >
                          <div onClick={() => toggleSection(category)} className="cursor-pointer flex items-center gap-2 flex-1 min-w-0">
                            <ChevronRight
                              size={14}
                              className="flex-shrink-0 transition-transform duration-200"
                              style={{ transform: expanded[category] ? "rotate(90deg)" : "rotate(0deg)" }}
                            />
                            <span className="font-bold text-sm whitespace-nowrap">{category}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${assignedCount === catControlIds.length ? "bg-green-200 text-green-800" : "bg-blue-100 text-blue-700"}`}>
                              {assignedCount}/{catControlIds.length} assigned
                            </span>
                          </div>
                          <div onClick={e => e.stopPropagation()} className="relative flex-shrink-0">
                            <select
                              value={(() => {
                                const vals = catControlIds.map(id => {
                                  const f = form.controls.find(c => c.controlId === id);
                                  return f ? f.assignedTo || "" : "";
                                });
                                const allSame = vals.length > 0 && vals.every(v => v !== "" && v === vals[0]);
                                return allSame ? vals[0] : "";
                              })()}
                              onChange={e => assignSection(catControlIds, e.target.value)}
                              className="text-xs py-1.5 pl-2 pr-6 rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer appearance-none min-w-36"
                            >
                              <option value="" disabled>Assign whole section…</option>
                              {sectionEligible.map(a => (
                                <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} color="#94a3b8" className="absolute right-2 top-2 pointer-events-none" />
                          </div>
                        </div>

                        {expanded[category] && Object.keys(grouped[category]).sort(sortClauses).map(prefix => {
                          const clauseControls   = grouped[category][prefix];
                          const clauseControlIds = clauseControls.map(c => c.controlId);
                          const clauseEligibleMap = {};
                          clauseControlIds.forEach(id =>
                            eligibleAuditors(id, apiControls).forEach(a => { clauseEligibleMap[String(a._id || a.id)] = a; })
                          );
                          const clauseEligible = Object.values(clauseEligibleMap);
                          return (
                            <div key={prefix} className="mt-2">
                              <div className="flex items-center justify-between mb-1.5 pl-1.5">
                                <div className="text-xs font-semibold text-slate-500">Clause {prefix}</div>
                                <div className="relative">
                                  <select
                                    onChange={e => assignClause(clauseControlIds, e.target.value)}
                                    className="text-xs py-1.5 pl-2 pr-6 rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer appearance-none min-w-28"
                                  >
                                    <option value="">Assign clause…</option>
                                    {clauseEligible.map(a => (
                                      <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>
                                    ))}
                                  </select>
                                  <ChevronDown size={12} color="#94a3b8" className="absolute right-2 top-2 pointer-events-none" />
                                </div>
                              </div>
                              {clauseControls.slice().sort((a, b) => sortClauses(a.clause, b.clause)).map(ctrl => {
                                const assignment = form.controls.find(c => c.controlId === ctrl.controlId) || {};
                                const eligible   = eligibleAuditors(ctrl.controlId, apiControls);
                                return (
                                  <div key={ctrl.controlId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50 mb-1.5">
                                    <div className="flex-1">
                                      <div className="text-xs font-bold text-blue-600">{ctrl.clause}</div>
                                      <div className="text-xs text-slate-600">{ctrl.label}</div>
                                    </div>
                                    <select
                                      value={assignment.assignedTo || ""}
                                      onChange={e => setAssignee(ctrl.controlId, e.target.value)}
                                      className="w-40 text-xs px-2 py-1.5 rounded-lg border border-slate-200"
                                    >
                                      <option value="">Assign auditor...</option>
                                      {eligible.map(a => (
                                        <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  });
              })()}
              {!ctrlLoading && (apiControls || []).length === 0 && (
                <p className="text-slate-400 text-sm text-center py-5">No controls found for {form.frameworkCode}.</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex-shrink-0 flex justify-between items-center px-7 py-4 border-t border-slate-100">
        {step > 1 ? (
          <button
            onClick={() => setStep(1)}
            className="text-slate-500 text-sm font-semibold bg-transparent border-none cursor-pointer px-0 py-2 hover:text-slate-700 transition-colors"
          >
            ← Back
          </button>
        ) : <div />}

        {step === 1 ? (
          <button
            disabled={!canNext || allowedFrameworks.length === 0}
            onClick={() => setStep(2)}
            className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow transition-all"
            style={{
              background: canNext && allowedFrameworks.length > 0 ? "#2563eb" : "#94a3b8",
              cursor: canNext && allowedFrameworks.length > 0 ? "pointer" : "not-allowed",
            }}
          >
            Next: Assign Controls →
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving || !allControlsAssigned}
            className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow transition-all"
            style={{
              background: saving || !allControlsAssigned ? "#94a3b8" : "#059669",
              cursor: saving || !allControlsAssigned ? "not-allowed" : "pointer",
            }}
          >
            {saving ? <RefreshCw size={14} /> : <Save size={14} />}
            {saving ? "Saving..." : "Create Audit"}
          </button>
        )}
      </div>
    </Modal>
  );
}

export default PlanAuditModal;