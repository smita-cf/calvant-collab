import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Send, Trash2, Eye, Search,
  CheckCircle, XCircle, Clock, FileText, RefreshCw
} from "lucide-react";
import tprmService from "../services/tprmService";

const STATUS_CONFIG = {
  DRAFT:     { label: "Draft",     cls: "bg-slate-100 text-slate-600",   dot: "#94a3b8" },
  SENT:      { label: "Sent",      cls: "bg-blue-100 text-blue-700",     dot: "#3b82f6" },
  SUBMITTED: { label: "Submitted", cls: "bg-amber-100 text-amber-700",   dot: "#f59e0b" },
  APPROVED:  { label: "Approved",  cls: "bg-emerald-100 text-emerald-700", dot: "#10b981" },
  REJECTED:  { label: "Rejected",  cls: "bg-red-100 text-red-700",       dot: "#ef4444" },
};

const QuestionnaireList = ({ user, organization, onReview, onRefreshStats }) => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("All");
  const [sendingId,      setSendingId]      = useState(null);
  const [deletingId,     setDeletingId]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tprmService.getQuestionnaires(organization);
      setQuestionnaires(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => { load(); }, [load]);

  const statuses = ["All", "DRAFT", "SENT", "SUBMITTED", "APPROVED", "REJECTED"];

  const filtered = questionnaires.filter(q => {
    const matchSearch = search === "" ||
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.vendorName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSend = async (q) => {
    if (!window.confirm(`Send "${q.title}" to ${q.vendorName}?`)) return;
    setSendingId(q.id);
    try {
      await tprmService.sendQuestionnaire(q.id);
      await load();
      onRefreshStats?.();
    } catch (e) {
      alert(e.message || "Failed to send");
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (q) => {
    if (!window.confirm(`Delete draft "${q.title}"? This cannot be undone.`)) return;
    setDeletingId(q.id);
    try {
      await tprmService.deleteQuestionnaire(q.id);
      await load();
      onRefreshStats?.();
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or vendor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={load}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <RefreshCw size={15} className="text-slate-600" />
        </button>
      </div>

      {/* Count */}
      <div className="text-sm text-slate-500 px-1">
        Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {questionnaires.length} assessments
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/70 border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No assessments found</p>
          <p className="text-slate-400 text-sm mt-1">Create a new questionnaire to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((q, i) => {
              const cfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.DRAFT;
              return (
                <motion.div
                  key={q.id}
                  className="bg-white/80 border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="flex items-start gap-4">
                    {/* Status dot */}
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-800 text-sm truncate">{q.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-slate-600">Vendor:</span> {q.vendorName || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-slate-600">Due:</span> {q.dueDate || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-slate-600">Questions:</span> {q.totalQuestions ?? q.questionIds?.length ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-slate-600">Created:</span> {formatDate(q.createdAt)}
                        </span>
                        {q.averageScore > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-slate-600">Avg Score:</span>
                            <span className="font-bold text-blue-600">{q.averageScore.toFixed(1)}/5</span>
                          </span>
                        )}
                      </div>

                      {/* Scoring progress */}
                      {q.status === "SUBMITTED" && q.totalQuestions > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${((q.scoredQuestions || 0) / q.totalQuestions) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {q.scoredQuestions || 0}/{q.totalQuestions} scored
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Send button — only for DRAFT */}
                      {q.status === "DRAFT" && (
                        <button
                          onClick={() => handleSend(q)}
                          disabled={sendingId === q.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                          {sendingId === q.id
                            ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Send size={12} />
                          }
                          Send
                        </button>
                      )}

                      {/* Review button — for SUBMITTED, APPROVED, REJECTED */}
                      {["SUBMITTED", "APPROVED", "REJECTED"].includes(q.status) && (
                        <button
                          onClick={() => onReview(q.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Eye size={12} />
                          Review
                        </button>
                      )}

                      {/* Delete — only for DRAFT */}
                      {q.status === "DRAFT" && (
                        <button
                          onClick={() => handleDelete(q)}
                          disabled={deletingId === q.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-60"
                        >
                          {deletingId === q.id
                            ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 size={14} />
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireList;