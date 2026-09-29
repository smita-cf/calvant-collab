import Link from 'next/link';




// C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\tprm\components\TPRMReportModal.js

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X, BarChart3, Eye, CheckCircle, XCircle,
  RefreshCw, ArrowLeft, FileText, Download, MessageSquare
} from "lucide-react";
import tprmService from "../services/tprmService";

/* ─── constants ──────────────────────────────────────────────────────────── */
const NAVBAR_HEIGHT = 72;
const MODAL_GAP     = 32;

const STATUS_CONFIG = {
  DRAFT:        { label: "Draft",        cls: "bg-slate-100 text-slate-600",     dot: "#94a3b8" },
  SENT:         { label: "Sent",         cls: "bg-blue-100 text-blue-700",       dot: "#3b82f6" },
  SUBMITTED:    { label: "Submitted",    cls: "bg-amber-100 text-amber-700",     dot: "#f59e0b" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-violet-100 text-violet-700",   dot: "#8b5cf6" },
  RESUBMITTED:  { label: "Resubmitted",  cls: "bg-orange-100 text-orange-700",   dot: "#f97316" },
  APPROVED:     { label: "Approved",     cls: "bg-emerald-100 text-emerald-700", dot: "#10b981" },
  REJECTED:     { label: "Rejected",     cls: "bg-red-100 text-red-700",         dot: "#ef4444" },
};

const AVAILABILITY_CONFIG = {
  Yes: { cls: "bg-emerald-100 text-emerald-700" },
  No:  { cls: "bg-red-100 text-red-700" },
};

/* ─── component ──────────────────────────────────────────────────────────── */
const TPRMReportModal = ({ user, organization, onClose, onRefresh }) => {
  const [questionnaires,     setQuestionnaires]     = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [selected,           setSelected]           = useState(null);
  const [pdfViewer,          setPdfViewer]          = useState(null);
  const [responses,          setResponses]          = useState([]);
  const [loadingReview,      setLoadingReview]      = useState(false);
  const [questionDecisions,  setQuestionDecisions]  = useState({});
  const [submittingReview,   setSubmittingReview]   = useState(false);
  const [actionLoading,      setActionLoading]      = useState(false);
  const [comment,            setComment]            = useState("");
  const [decision,           setDecision]           = useState(null);
  const [statusFilter,       setStatusFilter]       = useState("All");
  const [reviewError,        setReviewError]        = useState("");

  /* ── data ── */
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

  /* ── review ── */
  const openReview = async (q) => {
    setSelected(q);
    setLoadingReview(true);
    setReviewError("");
    try {
      const r = await tprmService.getResponses(q.id);
      setResponses(Array.isArray(r) ? r : []);
      const existing = {};
      r.forEach(resp => {
        existing[resp.questionId] = {
          status: resp.questionStatus || "",
          remark: resp.questionRemark || "",
        };
      });
      setQuestionDecisions(existing);
    } finally {
      setLoadingReview(false);
    }
  };

  const updateDecision = (questionId, field, value) => {
    setQuestionDecisions(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value }
    }));
  };

  const handleSubmitReview = async () => {
    const isResubmitted = selected?.status === "RESUBMITTED";
    const undecided = responses.filter(r => {
      if (isResubmitted && r.questionStatus === "ACCEPTED") return false;
      return !questionDecisions[r.questionId]?.status;
    });
    if (undecided.length > 0) {
      setReviewError(`Please Accept or Reject all ${undecided.length} remaining question(s) before submitting.`);
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    try {
      const reviewItems = responses.map(r => ({
        questionId: r.questionId,
        status: (isResubmitted && r.questionStatus === "ACCEPTED")
          ? "ACCEPTED"
          : questionDecisions[r.questionId]?.status || "ACCEPTED",
        remark: (isResubmitted && r.questionStatus === "ACCEPTED")
          ? r.questionRemark || ""
          : questionDecisions[r.questionId]?.remark || "",
      }));

      await tprmService.submitReview(selected.id, reviewItems, user?.name, user?.email);

      const hasRejected = reviewItems.some(r => r.status === "REJECTED");
      if (!hasRejected) {
        await tprmService.approveQuestionnaire(selected.id, "All questions accepted", user?.name, user?.email);
      }

      const updated = await tprmService.getQuestionnaire(selected.id);
      setSelected(updated);
      const r = await tprmService.getResponses(selected.id);
      setResponses(Array.isArray(r) ? r : []);
      await load();
      onRefresh?.();
    } catch (e) {
      setReviewError(e.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDecision = async (type) => {
    setActionLoading(true);
    try {
      if (type === "approve") {
        await tprmService.approveQuestionnaire(selected.id, comment, user?.name, user?.email);
      } else {
        await tprmService.rejectQuestionnaire(selected.id, comment, user?.name, user?.email);
      }
      setDecision(null);
      setComment("");
      const updated = await tprmService.getQuestionnaire(selected.id);
      setSelected(updated);
      await load();
      onRefresh?.();
    } catch (e) {
      alert(e.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── helpers ── */
  const grouped = responses.reduce((acc, r) => {
    const key = `${r.topicNo}||${r.topicName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const filteredQ = questionnaires.filter(q =>
    statusFilter === "All" || q.status === statusFilter
  );

  const canReview       = (status) => ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "APPROVED", "REJECTED"].includes(status);
  const canSubmitReview = (status) => ["SUBMITTED", "RESUBMITTED"].includes(status);

  const acceptedCount = Object.values(questionDecisions).filter(d => d.status === "ACCEPTED").length;
  const rejectedCount = Object.values(questionDecisions).filter(d => d.status === "REJECTED").length;

//date formsting in dd-mm-yyyy format,
  function formatDate(dateStr) {
  if (!dateStr) return "—";

  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

  /* ── render ── */
  return (
    <>
      {/* ── Main modal ── */}
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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              {selected && (
                <button
                  onClick={() => { setSelected(null); setResponses([]); setDecision(null); setReviewError(""); }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors mr-1"
                >
                  <ArrowLeft size={15} className="text-slate-600" />
                </button>
              )}
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <BarChart3 size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {selected ? selected.title : "TPRM Reports"}
                </h2>
                <p className="text-xs text-slate-500">
                  {selected
                    ? `Vendor: ${selected.vendorName} · ${responses.length} responses`
                    : `${questionnaires.length} assessments`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!selected && (
                <button onClick={load} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                  <RefreshCw size={14} className="text-slate-500" />
                </button>
              )}
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">

            {/* ────────────────── LIST VIEW ────────────────── */}
            {!selected && (
              <div className="p-6 space-y-4">
                {/* Filter tabs */}
                <div className="flex gap-1 flex-wrap">
                  {["All", "SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "APPROVED", "REJECTED"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {s === "All" ? "All" : s.replace("_", " ")}
                    </button>
                  ))}
                </div>

                {/* min-h keeps modal stable when switching filter tabs */}
                <div className="min-h-[320px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredQ.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48">
                      <BarChart3 size={36} className="text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">No assessments found</p>
                      <p className="text-slate-400 text-sm mt-1">
                        {statusFilter === "All" ? "No assessments exist yet." : `No items match the "${statusFilter.replace("_", " ")}" filter.`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredQ.map((q, i) => {
                        const cfg      = STATUS_CONFIG[q.status] || STATUS_CONFIG.DRAFT;
                        const reviewable = canReview(q.status);
                        return (
                          <motion.div key={q.id}
                            className={`flex items-center gap-4 p-4 border border-slate-100 rounded-xl transition-all
                              ${reviewable ? "hover:bg-slate-50 cursor-pointer" : ""}`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => reviewable && openReview(q)}
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
                              </div>
                            </div>
                            {reviewable && (
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                                <Eye size={11} /> Review
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ────────────────── REVIEW VIEW ────────────────── */}
            {selected && (
              <div className="p-6 space-y-4">
                {/* Status bar */}
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex gap-4 text-xs text-slate-600 flex-wrap">
                    <span>
                      <span className="font-semibold">Status: </span>
                      <span className={`ml-1.5 px-2 py-0.5 rounded-full font-semibold ${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.DRAFT).cls}`}>
                        {(STATUS_CONFIG[selected.status] || STATUS_CONFIG.DRAFT).label}
                      </span>
                    </span>
                    <span>
  <span className="font-semibold">Due:</span> {formatDate(selected.dueDate)}
</span>
                    {responses.length > 0 && (
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-600 font-semibold">✓ {acceptedCount} Accepted</span>
                        <span className="text-red-600 font-semibold">✗ {rejectedCount} Rejected</span>
                        <span className="text-slate-400">{responses.length - acceptedCount - rejectedCount} Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin comment */}
                {selected.adminComment && (
                  <div className={`border rounded-xl px-4 py-3 ${selected.status === "REJECTED" ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}`}>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Admin Comment</p>
                    <p className="text-sm text-slate-700">{selected.adminComment}</p>
                  </div>
                )}

                {/* Finalize panel */}
                {decision === "finalize" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-800 mb-1">Finalize Assessment</h4>
                    <p className="text-xs text-slate-500 mb-3">Add a comment and choose to Approve or Reject this assessment.</p>
                    <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Add a comment (optional)..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none mb-3" />
                    <div className="flex gap-2">
                      <button onClick={() => setDecision(null)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-white transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => handleDecision("reject")} disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-60">
                        {actionLoading
                          ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <XCircle size={13} />}
                        Reject
                      </button>
                      <button onClick={() => handleDecision("approve")} disabled={actionLoading}
                        className="flex-1 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow hover:bg-emerald-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {actionLoading
                          ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <CheckCircle size={13} />}
                        Approve
                      </button>
                    </div>
                  </div>
                )}

                {/* Responses */}
                {loadingReview ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : responses.length === 0 ? (
                  <div className="text-center py-10">
                    <FileText size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No responses yet</p>
                  </div>
                ) : (
                  Object.entries(grouped)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([key, resps], gi) => {
                      const [topicNo, topicName] = key.split("||");
                      return (
                        <motion.div key={key}
                          className="border border-slate-100 rounded-xl overflow-hidden shadow-sm"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: gi * 0.05 }}
                        >
                          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {topicNo}
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800">Section {topicNo}: {topicName}</h4>
                            <span className="text-xs text-slate-400 ml-auto">{resps.length} questions</span>
                          </div>

                          <div className="divide-y divide-slate-50">
                            {resps.map((r, ri) => {
                              const avCfg    = AVAILABILITY_CONFIG[r.availability] || {};
                              const dec      = questionDecisions[r.questionId] || {};
                              const isAccepted  = dec.status === "ACCEPTED";
                              const isRejected  = dec.status === "REJECTED";
                              const reviewable  = canSubmitReview(selected.status);

                              return (
                                <div key={r.id} className={`p-4 ${isRejected ? "bg-red-50/30" : isAccepted ? "bg-emerald-50/20" : ""}`}>
                                  <div className="flex items-start gap-2 mb-3">
                                    <span className="text-xs font-bold text-slate-400 w-5 flex-shrink-0 mt-0.5">{ri + 1}.</span>
                                    <p className="text-sm font-medium text-slate-800 flex-1">{r.questionText}</p>
                                    {r.questionStatus && (
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0
                                        ${r.questionStatus === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                        {r.questionStatus === "ACCEPTED" ? "✓ Accepted" : "✗ Rejected"}
                                      </span>
                                    )}
                                  </div>

                                  <div className="ml-7 grid grid-cols-3 gap-3 mb-3">
                                    <div className="bg-white rounded-xl border border-slate-100 p-2.5">
                                      <p className="text-xs font-medium text-slate-500 mb-1">Response</p>
                                      {r.availability
                                        ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${avCfg.cls}`}>{r.availability}</span>
                                        : <span className="text-xs text-slate-400 italic">—</span>
                                      }
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-100 p-2.5">
                                      <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                                      <p className="text-xs text-slate-700 line-clamp-2">
                                        {r.descriptionOfPractice || <span className="italic text-slate-400">Not provided</span>}
                                      </p>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-100 p-2.5">
                                      <p className="text-xs font-medium text-slate-500 mb-1">Document</p>
                                      {r.referenceDocumentName ? (
                                        <button
                                          onClick={() => setPdfViewer({ url: tprmService.getFileUrl(r.referenceDocumentUrl), name: r.referenceDocumentName })}
                                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                        >
                                          <FileText size={10} /> {r.referenceDocumentName}
                                        </button>
                                      ) : <span className="text-xs text-slate-400 italic">No file</span>}
                                    </div>
                                  </div>

                                  {reviewable && r.questionStatus === "ACCEPTED" ? (
                                    <div className="ml-7 rounded-xl p-3 border bg-emerald-50/50 border-emerald-100 opacity-60">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle size={13} className="text-emerald-500" />
                                        <span className="text-xs font-semibold text-emerald-700">Accepted in previous review — no changes needed</span>
                                      </div>
                                      {r.questionRemark && <p className="text-xs text-slate-500 mt-1 ml-5">{r.questionRemark}</p>}
                                    </div>
                                  ) : (
                                    <div className={`ml-7 rounded-xl p-3 border ${
                                      isAccepted ? "bg-emerald-50 border-emerald-100" :
                                      isRejected ? "bg-red-50 border-red-100" :
                                      "bg-slate-50 border-slate-100"
                                    }`}>
                                      {reviewable ? (
                                        <>
                                          <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-semibold text-slate-600">Admin Decision:</span>
                                            <button
                                              onClick={() => updateDecision(r.questionId, "status", "ACCEPTED")}
                                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                                                ${isAccepted
                                                  ? "bg-emerald-600 text-white border-emerald-600 shadow"
                                                  : "bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50"}`}
                                            >
                                              <CheckCircle size={12} /> Accept
                                            </button>
                                            <button
                                              onClick={() => updateDecision(r.questionId, "status", "REJECTED")}
                                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                                                ${isRejected
                                                  ? "bg-red-600 text-white border-red-600 shadow"
                                                  : "bg-white text-red-600 border-red-300 hover:bg-red-50"}`}
                                            >
                                              <XCircle size={12} /> Reject
                                            </button>
                                          </div>
                                          <input
                                            type="text"
                                            placeholder={isRejected ? "Explain why this was rejected..." : "Add remark (optional)..."}
                                            value={dec.remark || ""}
                                            onChange={e => updateDecision(r.questionId, "remark", e.target.value)}
                                            className={`w-full text-xs border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 bg-white placeholder:text-slate-400
                                              ${isRejected ? "border-red-200 focus:ring-red-500/20" : "border-slate-200 focus:ring-indigo-500/20"}`}
                                          />
                                        </>
                                      ) : (
                                        <div className="flex items-start gap-2">
                                          <span className="text-xs font-semibold text-slate-600">Admin Remark:</span>
                                          <p className="text-xs text-slate-700">{r.questionRemark || <span className="italic text-slate-400">No remark</span>}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })
                )}

                {/* Submit review — sticky at bottom */}
                {canSubmitReview(selected?.status) && responses.length > 0 && (
                  <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 -mx-6 px-6 py-4">
                    {reviewError && (
                      <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-3">{reviewError}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        <span className="text-emerald-600 font-semibold">{acceptedCount} accepted</span>
                        {" · "}
                        <span className="text-red-600 font-semibold">{rejectedCount} rejected</span>
                        {" · "}
                        <span>{responses.length - acceptedCount - rejectedCount} pending</span>
                      </div>
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-60"
                      >
                        {submittingReview
                          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <MessageSquare size={14} />
                        }
                        {submittingReview ? "Processing..." : rejectedCount > 0 ? "Submit Review (Send Back)" : "Submit Review (Approve All)"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── PDF Viewer modal ── */}
      {pdfViewer && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setPdfViewer(null)}
          onKeyDown={e => e.key === "Escape" && setPdfViewer(null)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[75vh] flex flex-col mt-16"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-red-500" />
                <span className="text-sm font-semibold text-slate-800 truncate">{pdfViewer.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={pdfViewer.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download size={12} /> Open in Tab
                </Link>
                <button onClick={() => setPdfViewer(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-b-2xl">
              <iframe
                src={`${pdfViewer.url}#toolbar=1&navpanes=0`}
                title={pdfViewer.name}
                className="w-full h-full border-0"
                type="application/pdf"
              />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default TPRMReportModal;
