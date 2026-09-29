import Link from 'next/link';
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Upload, Trash2, Check, Send,
  FileText, AlertCircle, CheckCircle, Clock, X
} from "lucide-react";
import tprmService from "../services/tprmService";

const AVAILABILITY_OPTIONS = ["Yes", "No"];

const AVAILABILITY_CONFIG = {
  Yes: { cls: "border-emerald-400 bg-emerald-50 text-emerald-700", selected: "bg-emerald-500 text-white border-emerald-500" },
  No:  { cls: "border-red-400 bg-red-50 text-red-700",             selected: "bg-red-500 text-white border-red-500" },
};

const VendorAnswerForm = ({ user, questionnaireId, onBack }) => {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [questions,     setQuestions]     = useState([]);
  const [responses,     setResponses]     = useState({});
  const [loading,       setLoading]       = useState(true);
  const [savingId,      setSavingId]      = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState("");
  const [submitted,     setSubmitted]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [q, existingResponses] = await Promise.all([
        tprmService.getQuestionnaire(questionnaireId),
        tprmService.getMyResponses(questionnaireId),
      ]);
      setQuestionnaire(q);

      if (Array.isArray(existingResponses) && existingResponses.length > 0) {
        const qList = existingResponses.map(r => ({
          id:        r.questionId,
          topicNo:   r.topicNo,
          topicName: r.topicName,
          text:      r.questionText,
          category:  r.category,
        }));
        setQuestions(qList);

        const prefilled = {};
        existingResponses.forEach(r => {
          prefilled[r.questionId] = {
            availability:   r.availability || "",
            description:    r.descriptionOfPractice || "",
            file:           null,
            existingFile:   r.referenceDocumentName || null,
            existingUrl:    r.referenceDocumentUrl || null,
            saved:          !!r.availability,
            questionStatus: r.questionStatus || null,
            questionRemark: r.questionRemark || "",
          };
        });
        setResponses(prefilled);
      } else if (q?.questionIds?.length > 0) {
        const allQ = await tprmService.getQuestions(q.organization || "");
        const filtered = allQ.filter(aq => q.questionIds.includes(aq.id));
        setQuestions(filtered);
        const empty = {};
        filtered.forEach(fq => {
          empty[fq.id] = { availability: "", description: "", file: null, existingFile: null, saved: false };
        });
        setResponses(empty);
      }
    } finally {
      setLoading(false);
    }
  }, [questionnaireId]);

  useEffect(() => { load(); }, [load]);

  const updateResponse = (questionId, field, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value, saved: false }
    }));
  };

  const handleDeleteFile = async (questionId) => {
    if (!window.confirm("Delete the uploaded document? This cannot be undone.")) return;
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        existingFile: null,
        existingUrl:  null,
        file:         null,
        saved:        false,
      }
    }));
    const r = responses[questionId];
    if (r?.availability) {
      setSavingId(questionId);
      try {
        await tprmService.saveAnswer(questionnaireId, questionId, r.availability, r.description || "", null);
      } catch (e) {
        console.error("Error clearing file:", e);
      } finally {
        setSavingId(null);
      }
    }
  };

  const handleSave = async (questionId, silent = false) => {
    const r = responses[questionId];
    if (!r?.availability) return;
    setSavingId(questionId);
    try {
      await tprmService.saveAnswer(questionnaireId, questionId, r.availability, r.description || "", r.file || null);
      setResponses(prev => ({
        ...prev,
        [questionId]: { ...prev[questionId], saved: true, file: null }
      }));
      if (!silent) await load();
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSavingId(null);
    }
  };

  const handleSubmit = async () => {
    const currentQ = await tprmService.getQuestionnaire(questionnaireId);
    const isUnderReview = currentQ?.status === "UNDER_REVIEW";

    if (isUnderReview) {
      const rejectedUnanswered = questions.filter(q =>
        responses[q.id]?.questionStatus === "REJECTED" && !responses[q.id]?.availability
      );
      if (rejectedUnanswered.length > 0) {
        setSubmitError(`Please re-answer all rejected questions. ${rejectedUnanswered.length} remaining.`);
        return;
      }
    } else {
      const unanswered = questions.filter(q => !responses[q.id]?.availability);
      if (unanswered.length > 0) {
        setSubmitError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
        return;
      }
    }

    for (const q of questions) {
      const r = responses[q.id];
      if (r?.availability && !r.saved && r.questionStatus !== "ACCEPTED") {
        await handleSave(q.id, true); // silent — no reload during submit
      }
    }

  //   setSubmitting(true);
  //   setSubmitError("");
  //   try {
  //     const currentQ = await tprmService.getQuestionnaire(questionnaireId);
  //     if (currentQ?.status === "UNDER_REVIEW") {
  //       await tprmService.resubmitQuestionnaire(questionnaireId);
  //     } else {
  //       await tprmService.submitQuestionnaire(questionnaireId);
  //     }
  //     setSubmitted(true);
  //   } catch (e) {
  //     setSubmitError(e.message || "Failed to submit. Please try again.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
   setSubmitting(true);
  setSubmitError("");
  try {
    const currentQ = await tprmService.getQuestionnaire(questionnaireId);
    const adminEmail = currentQ?.createdByEmail; // ← read admin email from questionnaire

    if (currentQ?.status === "UNDER_REVIEW") {
      await tprmService.resubmitQuestionnaire(questionnaireId, adminEmail); // ← pass it
    } else {
      await tprmService.submitQuestionnaire(questionnaireId, adminEmail);   // ← pass it
    }
    setSubmitted(true);
  } catch (e) {
    setSubmitError(e.message || "Failed to submit. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  const answeredCount = questions.filter(q => responses[q.id]?.availability).length;
  const totalCount    = questions.length;
  const progress      = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  const grouped = questions.reduce((acc, q) => {
    const key = `${q.topicNo}||${q.topicName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  // ── Submitted Success Screen — no animation ───────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Successfully Submitted!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your assessment has been submitted to the admin for review. You'll be notified once it's reviewed.
          </p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl shadow hover:shadow-md transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 pb-32">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-md mb-6 p-5">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors flex-shrink-0 mt-0.5"
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-slate-800">{questionnaire?.title}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> Due: <span className="font-medium text-slate-700 ml-1">{questionnaire?.dueDate || "—"}</span>
                </span>
                <span>{totalCount} questions</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                  {answeredCount}/{totalCount} answered
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Questions by Topic ──────────────────────────────── */}
        <div className="space-y-5">
          {Object.entries(grouped)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([key, qs], gi) => {
              const [topicNo, topicName] = key.split("||");
              return (
                <div
                  key={key}
                  className="bg-white/80 border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Topic header */}
                  <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {topicNo}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">{topicName}</h3>
                    <span className="text-xs text-slate-400 ml-auto">
                      {qs.filter(q => responses[q.id]?.availability).length}/{qs.length} answered
                    </span>
                  </div>

                  {/* Questions */}
                  <div className="divide-y divide-slate-50">
                    {qs.map((q, qi) => {
                      const r = responses[q.id] || {};
                      const isSaving = savingId === q.id;
                      const isSaved  = r.saved;

                      return (
                        <div key={q.id} className="p-5">
                          {/* Question text */}
                          <div className="flex items-start gap-2 mb-4">
                            <span className="text-xs font-bold text-slate-400 mt-0.5 flex-shrink-0 w-5">{qi + 1}.</span>
                            <p className="text-sm font-medium text-slate-800 flex-1 leading-relaxed">{q.text}</p>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {r.questionStatus === "ACCEPTED" && (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  ✓ Accepted
                                </span>
                              )}
                              {r.questionStatus === "REJECTED" && (
                                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                  ✗ Rejected — please re-answer
                                </span>
                              )}
                              {!r.questionStatus && isSaved && (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <Check size={10} /> Saved
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Show admin remark if rejected */}
                          {r.questionRemark && r.questionStatus === "REJECTED" && (
                            <div className="ml-7 mb-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                              <p className="text-xs font-semibold text-red-600 mb-0.5">Admin Remark:</p>
                              <p className="text-xs text-red-700">{r.questionRemark}</p>
                            </div>
                          )}

                          {/* Accepted — greyed out, locked */}
                          {r.questionStatus === "ACCEPTED" ? (
                            <div className="ml-7 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 opacity-60">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${r.availability === "Yes" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  {r.availability}
                                </span>
                                <p className="text-xs text-emerald-600 font-medium">✓ This answer has been accepted — no changes allowed</p>
                              </div>
                              {r.description && (
                                <p className="text-xs text-slate-500 line-clamp-2">{r.description}</p>
                              )}
                              {r.existingFile && (
                                <p className="text-xs text-blue-500 mt-1">📎 {r.existingFile}</p>
                              )}
                            </div>
                          ) : (
                            <div className="ml-7 space-y-4">
                              {/* Yes / No */}
                              <div className="flex gap-2">
                                {AVAILABILITY_OPTIONS.map(opt => {
                                  const cfg = AVAILABILITY_CONFIG[opt];
                                  const isSelected = r.availability === opt;
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => updateResponse(q.id, "availability", opt)}
                                      className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all
                                        ${isSelected ? cfg.selected : `${cfg.cls} hover:opacity-80`}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Description — only when Yes */}
                              {r.availability === "Yes" && (
                                <div>
                                  <label className="text-xs font-semibold text-slate-600 mb-2 block">
                                    Provide further description documentation on the configuration.
                                    <span className="text-slate-400 font-normal ml-1">(optional)</span>
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={r.description || ""}
                                    onChange={e => updateResponse(q.id, "description", e.target.value)}
                                    placeholder="Describe how your organization handles this..."
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none placeholder:text-slate-400"
                                  />
                                </div>
                              )}

                              {/* File Upload */}
                              <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block">
                                  Reference Document
                                  <span className="text-slate-400 font-normal ml-1">(PDF, max 10MB)</span>
                                  {r.questionStatus === "REJECTED" && (
                                    <span className="ml-2 text-red-500 font-semibold">— Please re-upload if needed</span>
                                  )}
                                </label>

                                {/* Existing file */}
                                {r.existingFile && !r.file && (
                                  <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-2 border
                                    ${r.questionStatus === "REJECTED" ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                                    <FileText size={14} className={r.questionStatus === "REJECTED" ? "text-red-400 flex-shrink-0" : "text-blue-500 flex-shrink-0"} />
                                    <span className="text-xs text-slate-700 flex-1 truncate">{r.existingFile}</span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <Link
                                        href={tprmService.getFileUrl(r.existingUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        View
                                      </Link>
                                      <button
                                        onClick={() => handleDeleteFile(q.id)}
                                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-100 px-1.5 py-0.5 rounded-lg transition-colors"
                                        title="Delete document"
                                      >
                                        <Trash2 size={11} /> Delete
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* New file selected */}
                                {r.file && (
                                  <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 mb-2">
                                    <FileText size={14} className="text-indigo-500 flex-shrink-0" />
                                    <span className="text-xs text-slate-700 flex-1 truncate">{r.file.name}</span>
                                    <button
                                      onClick={() => updateResponse(q.id, "file", null)}
                                      className="p-0.5 hover:bg-indigo-100 rounded transition-colors flex-shrink-0"
                                    >
                                      <X size={12} className="text-slate-500" />
                                    </button>
                                  </div>
                                )}

                                {/* Upload button */}
                                <label className={`flex items-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all group
                                  ${r.questionStatus === "REJECTED"
                                    ? "border-red-300 hover:border-red-400 hover:bg-red-50/50 bg-red-50/30"
                                    : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50"
                                  }`}>
                                  <Upload size={15} className={`flex-shrink-0 ${r.questionStatus === "REJECTED" ? "text-red-400 group-hover:text-red-500" : "text-slate-400 group-hover:text-indigo-500"}`} />
                                  <span className={`text-xs ${r.questionStatus === "REJECTED" ? "text-red-500 font-medium" : "text-slate-500 group-hover:text-indigo-600"}`}>
                                    {r.file ? "Replace file" : r.existingFile
                                      ? (r.questionStatus === "REJECTED" ? "Re-upload document" : "Upload new file")
                                      : "Upload PDF document"}
                                  </span>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={e => {
                                      const f = e.target.files?.[0];
                                      if (f) updateResponse(q.id, "file", f);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      {/* ── Sticky Submit Footer ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-2xl px-4 py-4 z-50">
        <div className="max-w-4xl mx-auto">
          {submitError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-3">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">
                  {answeredCount} of {totalCount} questions answered
                </span>
                <span className="text-xs font-bold text-indigo-600">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || answeredCount === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 whitespace-nowrap"
            >
              <Send size={15} />
              {questionnaire?.status === "UNDER_REVIEW" ? "Resubmit Assessment" : "Submit Assessment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnswerForm;
