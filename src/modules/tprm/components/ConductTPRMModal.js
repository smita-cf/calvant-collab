

// C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\tprm\components\ConductTPRMModal.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X, ClipboardList, Plus, Send, Trash2, Search,
  Check, ChevronDown, ChevronUp, User, Calendar,
  FileText, RefreshCw,
} from "lucide-react";
import tprmService from "../services/tprmService";

/* ─── constants ──────────────────────────────────────────────────────────── */
const NAVBAR_HEIGHT = 72;  // px — fixed top navbar from PersistentSidebar
const MODAL_GAP     = 32;  // px gap between navbar bottom and modal top

const STATUS_CONFIG = {
  DRAFT:        { label: "Draft",        cls: "bg-slate-100 text-slate-600",     dot: "#94a3b8" },
  SENT:         { label: "Sent",         cls: "bg-blue-100 text-blue-700",       dot: "#3b82f6" },
  SUBMITTED:    { label: "Submitted",    cls: "bg-amber-100 text-amber-700",     dot: "#f59e0b" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-violet-100 text-violet-700",   dot: "#8b5cf6" },
  RESUBMITTED:  { label: "Resubmitted",  cls: "bg-orange-100 text-orange-700",   dot: "#f97316" },
  APPROVED:     { label: "Approved",     cls: "bg-emerald-100 text-emerald-700", dot: "#10b981" },
  REJECTED:     { label: "Rejected",     cls: "bg-red-100 text-red-700",         dot: "#ef4444" },
};

/* ─── component ──────────────────────────────────────────────────────────── */
const ConductTPRMModal = ({ user, organization, onClose, onSaved }) => {
  const [view,           setView]           = useState("list");
  const [questionnaires, setQuestionnaires] = useState([]);
  const [questions,      setQuestions]      = useState([]);
  const [vendors,        setVendors]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [sendingId,      setSendingId]      = useState(null);
  const [deletingId,     setDeletingId]     = useState(null);
  const [editingId,      setEditingId]      = useState(null);
  const [error,          setError]          = useState("");
  const [search,         setSearch]         = useState("");
  const [step,           setStep]           = useState(1);
  const [selectedQIds,   setSelectedQIds]   = useState([]);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [statusFilter,   setStatusFilter]   = useState("All");

  const [form, setForm] = useState({
    title: "", vendorId: "", vendorName: "", vendorEmail: "", dueDate: "",
  });


//convert date to dd-mm-yyyy format, or return "—" if invalid
  const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

  /* ── data ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qs, allUsers, qlist] = await Promise.all([
        tprmService.getQuestionnaires(organization),
        fetch(
          `https://api.calvant.com/user-service/api/users?organization=${organization}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          },
        ).then(r => r.ok ? r.json() : []),
        tprmService.getQuestions(organization),
      ]);
      setQuestionnaires(Array.isArray(qs) ? qs : []);
      const tprmUsers = Array.isArray(allUsers)
        ? allUsers.filter(u =>
            Array.isArray(u.modules) &&
            u.modules.includes("tprm") &&
            u.role.includes("user"),
          )
        : [];
      setVendors(tprmUsers);
      setQuestions(Array.isArray(qlist) ? qlist : []);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => { load(); }, [load]);

  /* ── filtered / sorted list ── */
  const filteredList = useMemo(() => {
    let list = [...questionnaires];
    if (statusFilter !== "All") {
      if (statusFilter === "Due")
        list = list.filter(q => ["SENT", "SUBMITTED", "RESUBMITTED"].includes(q.status));
      else if (statusFilter === "Received")
        list = list.filter(q => q.status === "UNDER_REVIEW");
      else if (statusFilter === "Completed")
        list = list.filter(q => ["APPROVED", "REJECTED"].includes(q.status));
      else
        list = list.filter(q => q.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }, [questionnaires, statusFilter]);

  /* ── edit ── */
  const openEdit = (q) => {
    setEditingId(q.id);
    setForm({
      title: q.title,
      vendorId: q.vendorId,
      vendorName: q.vendorName,
      vendorEmail: q.vendorEmail || "",
      dueDate: q.dueDate,
    });
    setSelectedQIds(Array.isArray(q.questionIds) ? q.questionIds : []);
    setStep(1);
    setError("");
    setView("edit");
  };

  /* ── send / delete ── */
  const handleSend = async (q) => {
    setSendingId(q.id);
    try {
      await tprmService.sendQuestionnaire(q.id, user?.email);
      await load();
      onSaved?.();
    } catch (e) {
      alert(e.message || "Failed to send");
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (q) => {
    if (!window.confirm(`Delete draft "${q.title}"?`)) return;
    setDeletingId(q.id);
    try {
      await tprmService.deleteQuestionnaire(q.id);
      await load();
      onSaved?.();
    } finally {
      setDeletingId(null);
    }
  };

  /* ── question selection ── */
  const filtered = questions.filter(q =>
    search === "" ||
    q.text?.toLowerCase().includes(search.toLowerCase()) ||
    q.topicName?.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce((acc, q) => {
    const key = `${q.topicNo}||${q.topicName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  const allQuestionIds = questions.map(q => q.id);
  const allSelected    = allQuestionIds.length > 0 && allQuestionIds.every(id => selectedQIds.includes(id));

  const toggleSelectAll = () => setSelectedQIds(allSelected ? [] : [...allQuestionIds]);
  const toggleQuestion  = (id) =>
    setSelectedQIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleTopic = (key, qs) => {
    const ids    = qs.map(q => q.id);
    const allSel = ids.every(id => selectedQIds.includes(id));
    setSelectedQIds(prev =>
      allSel ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])],
    );
  };

  const handleVendorChange = (e) => {
    const val      = e.target.value;
    const selected = vendors.find(v => (v._id || v.id) === val);
    if (selected) {
      setForm(f => ({
        ...f,
        vendorId:    selected._id || selected.id,
        vendorName:  selected.name || selected.username || "",
        vendorEmail: selected.email || "",
      }));
    } else {
      setForm(f => ({ ...f, vendorId: "", vendorName: "", vendorEmail: "" }));
    }
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!form.title.trim())      return setError("Title is required");
    if (!form.vendorId)          return setError("Please select a vendor");
    if (!form.dueDate)           return setError("Due date is required");
    if (selectedQIds.length === 0) return setError("Select at least one question");

    setSaving(true);
    setError("");
    try {
      let questionnaireId = editingId;
      if (editingId) {
        await tprmService.updateQuestionnaire(editingId, {
          title: form.title, vendorId: form.vendorId, vendorName: form.vendorName,
          vendorEmail: form.vendorEmail || "", dueDate: form.dueDate, questionIds: selectedQIds,
        });
      } else {
        const created = await tprmService.createQuestionnaire({
          title: form.title, vendorId: form.vendorId, vendorName: form.vendorName,
          vendorEmail: form.vendorEmail || "", dueDate: form.dueDate,
          organization, questionIds: selectedQIds,
          createdBy: user?._id || user?.id, createdByName: user?.name, createdByEmail: user?.email,
        });
        questionnaireId = created?.id || created?._id;
      }
      if (questionnaireId) {
        await tprmService.sendQuestionnaire(questionnaireId, user?.email);
      }
      setView("list"); setStep(1); setEditingId(null);
      setForm({ title: "", vendorId: "", vendorName: "", vendorEmail: "", dueDate: "" });
      setSelectedQIds([]);
      await load();
      onSaved?.();
    } catch (e) {
      setError(e.message || (editingId ? "Failed to submit" : "Failed to create and submit"));
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  /* ── render ── */
  return (
    /*
     * Overlay scrolls the page when content is very tall.
     * paddingTop pushes the modal below the navbar + gap.
     * The modal itself is NOT vertically centered — it starts near the top
     * and grows downward, so switching tabs doesn't shift the opening position.
     */
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
      style={{ paddingTop: NAVBAR_HEIGHT + MODAL_GAP, paddingBottom: MODAL_GAP }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto flex flex-col"
        style={{ maxHeight: `calc(100vh - ${NAVBAR_HEIGHT + MODAL_GAP * 2}px)` }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
              <ClipboardList size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Conduct TPRM</h2>
              <p className="text-xs text-slate-500">
                {view === "list"
                  ? `${questionnaires.length} assessments`
                  : view === "edit"
                    ? "Edit draft assessment"
                    : "Create new assessment"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === "list" && (
              <button
                onClick={() => {
                  setView("create"); setStep(1); setError("");
                  setSelectedQIds([]); setExpandedTopics({});
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow"
              >
                <Plus size={13} /> New Assessment
              </button>
            )}
            {(view === "create" || view === "edit") && (
              <button
                onClick={() => { setView("list"); setEditingId(null); setError(""); }}
                className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                ← Back to List
              </button>
            )}
            <button onClick={load} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
              <RefreshCw size={14} className="text-slate-500" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* ── Body — scrolls inside the modal ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ────────────────── LIST VIEW ────────────────── */}
          {view === "list" && (
            <div className="p-6 space-y-3">
              {/* Filter tabs */}
              <div className="flex gap-1 flex-wrap mb-4">
                {["All", "Due", "Received", "Completed"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === tab
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* List content
                  min-h keeps the modal the same height regardless of how many
                  items are shown — the content area never collapses. */}
              <div className="min-h-[320px]">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : questionnaires.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <ClipboardList size={36} className="text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No assessments yet</p>
                    <p className="text-slate-400 text-sm mt-1">Click "New Assessment" to create one</p>
                  </div>
                ) : filteredList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <Search size={24} className="text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No assessments found</p>
                    <p className="text-slate-400 text-sm mt-1">No items match the "{statusFilter}" filter.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredList.map((q, i) => {
                      const cfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.DRAFT;
                      return (
                        <motion.div
                          key={q.id}
                          className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.dot }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <h4 className="text-sm font-semibold text-slate-800 truncate">{q.title}</h4>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                            </div>
                            <div className="flex gap-3 text-xs text-slate-500">
                              <span><span className="font-medium">Vendor:</span> {q.vendorName}</span>
                              <span>
  <span className="font-medium">Due:</span> {formatDate(q.dueDate)}
</span>
                              <span>{q.totalQuestions ?? q.questionIds?.length ?? 0} questions</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {q.status === "DRAFT" && (
                              <button
                                onClick={() => handleDelete(q)}
                                disabled={deletingId === q.id}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────── CREATE / EDIT VIEW ────────────────── */}
          {(view === "create" || view === "edit") && (
            <div className="p-6">
              {/* Step tabs */}
              <div className="flex gap-2 mb-6">
                {["Assessment Details", "Select Questions"].map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i + 1)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${step === i + 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold
                      ${step === i + 1 ? "bg-white text-indigo-600" : "bg-slate-300 text-white"}`}>
                      {i + 1}
                    </span>
                    {label}
                  </button>
                ))}
              </div>

              {/* Step 1 — Assessment Details */}
              {step === 1 && (
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <FileText size={12} /> Assessment Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      placeholder="e.g. Q1 2026 Vendor Security Assessment"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <User size={12} /> Assign to Vendor *
                    </label>
                    <select
                      value={form.vendorId}
                      onChange={handleVendorChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
                    >
                      <option value="">Select vendor...</option>
                      {vendors.map(v => (
                        <option key={v._id || v.id} value={v._id || v.id}>
                          {v.name || v.username}
                        </option>
                      ))}
                    </select>
                    {vendors.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 rounded-lg px-3 py-1.5">
                        No vendors found with TPRM module access.
                      </p>
                    )}
                    {form.vendorName && (
                      <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                        <Check size={11} /> {form.vendorName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <Calendar size={12} /> Due Date *
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={form.dueDate}
                      onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button
                    onClick={() => {
                      if (!form.title.trim()) return setError("Title is required");
                      if (!form.vendorId)    return setError("Select a vendor");
                      if (!form.dueDate)     return setError("Due date is required");
                      setError(""); setStep(2);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all"
                  >
                    Next: Select Questions →
                  </button>
                </div>
              )}

              {/* Step 2 — Select Questions */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-slate-50"
                      />
                    </div>
                    <button
                      onClick={toggleSelectAll}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                        ${allSelected
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50"}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0
                        ${allSelected ? "bg-white border-white" : "border-indigo-400"}`}>
                        {allSelected && <Check size={8} className="text-indigo-600" />}
                      </div>
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                    <div className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                      {selectedQIds.length} / {questions.length} selected
                    </div>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {Object.entries(grouped)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([key, qs]) => {
                        const [topicNo, topicName] = key.split("||");
                        const ids    = qs.map(q => q.id);
                        const allSel = ids.every(id => selectedQIds.includes(id));
                        const someSel = ids.some(id => selectedQIds.includes(id));
                        const isExpanded = expandedTopics[key] === true;
                        return (
                          <div key={key} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div
                              className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={() => setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }))}
                            >
                              <button
                                onClick={e => { e.stopPropagation(); toggleTopic(key, qs); }}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                                  ${allSel ? "bg-indigo-600 border-indigo-600" : someSel ? "bg-indigo-200 border-indigo-400" : "bg-white border-slate-300"}`}
                              >
                                {allSel  && <Check size={10} className="text-white" />}
                                {someSel && !allSel && <div className="w-2 h-2 bg-indigo-500 rounded-sm" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Section {topicNo}</span>
                                <h4 className="text-sm font-bold text-slate-800 leading-tight">{topicName}</h4>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                  ${allSel ? "bg-indigo-100 text-indigo-700" : someSel ? "bg-indigo-50 text-indigo-500" : "bg-slate-100 text-slate-500"}`}>
                                  {ids.filter(id => selectedQIds.includes(id)).length}/{qs.length}
                                </span>
                                {isExpanded
                                  ? <ChevronUp size={16} className="text-slate-400" />
                                  : <ChevronDown size={16} className="text-slate-400" />
                                }
                              </div>
                            </div>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="divide-y divide-slate-50"
                              >
                                {qs.map((q, qi) => {
                                  const isSel = selectedQIds.includes(q.id);
                                  return (
                                    <div
                                      key={q.id}
                                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors text-xs
                                        ${isSel ? "bg-indigo-50/50" : "hover:bg-slate-50/50"}`}
                                      onClick={() => toggleQuestion(q.id)}
                                    >
                                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                                        ${isSel ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"}`}>
                                        {isSel && <Check size={9} className="text-white" />}
                                      </div>
                                      <span className="text-slate-400 w-5 flex-shrink-0 font-medium">{qi + 1}.</span>
                                      <p className="text-slate-700 flex-1 leading-relaxed text-xs">{q.text}</p>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Summary + Submit */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Title",     value: form.title },
                        { label: "Vendor",    value: form.vendorName },
                        { label: "Due Date", value: formatDate(form.dueDate) },
                        { label: "Questions", value: `${selectedQIds.length} selected` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                    {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-white transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={saving || selectedQIds.length === 0}
                        className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {saving
                          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <Send size={14} />
                        }
                        {saving ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ConductTPRMModal;