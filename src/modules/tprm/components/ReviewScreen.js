import Link from 'next/link';
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle, XCircle, Star, FileText,
  Download, MessageSquare, Shield, Clock, User, Calendar
} from "lucide-react";
import tprmService from "../services/tprmService";

const AVAILABILITY_CONFIG = {
  Yes:     { cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  No:      { cls: "bg-red-100 text-red-700",         dot: "bg-red-500" },
  Partial: { cls: "bg-amber-100 text-amber-700",     dot: "bg-amber-500" },
};

const STATUS_CONFIG = {
  SUBMITTED: { cls: "bg-amber-100 text-amber-700",     icon: Clock },
  APPROVED:  { cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  REJECTED:  { cls: "bg-red-100 text-red-700",         icon: XCircle },
};

const ScoreButton = ({ value, selected, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-200
      ${selected
        ? "bg-blue-600 text-white shadow-md scale-105"
        : "bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700"
      }`}
  >
    {value}
  </button>
);

const ReviewScreen = ({ user, questionnaireId, onBack, onRefreshStats }) => {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [responses,     setResponses]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [scores,        setScores]        = useState({}); // questionId → score
  const [remarks,       setRemarks]       = useState({}); // questionId → remark
  const [savingScore,   setSavingScore]   = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment,       setComment]       = useState("");
  const [showDecision,  setShowDecision]  = useState(false);
  const [decisionType,  setDecisionType]  = useState(null); // "approve" | "reject"

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [q, r] = await Promise.all([
        tprmService.getQuestionnaire(questionnaireId),
        tprmService.getResponses(questionnaireId),
      ]);
      setQuestionnaire(q);
      setResponses(Array.isArray(r) ? r : []);

      // Pre-fill existing scores
      const existingScores = {};
      const existingRemarks = {};
      r.forEach(resp => {
        if (resp.adminScore != null) existingScores[resp.questionId] = resp.adminScore;
        if (resp.adminRemark)        existingRemarks[resp.questionId] = resp.adminRemark;
      });
      setScores(existingScores);
      setRemarks(existingRemarks);
    } finally {
      setLoading(false);
    }
  }, [questionnaireId]);

  useEffect(() => { load(); }, [load]);

  const handleScoreClick = async (questionId, score) => {
    setScores(prev => ({ ...prev, [questionId]: score }));
    setSavingScore(questionId);
    try {
      await tprmService.scoreQuestion(
        questionnaireId, questionId, score, remarks[questionId] || ""
      );
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingScore(null);
    }
  };

  const handleRemarkBlur = async (questionId) => {
    const score = scores[questionId];
    if (!score) return; // Need score to save remark
    setSavingScore(questionId);
    try {
      await tprmService.scoreQuestion(questionnaireId, questionId, score, remarks[questionId] || "");
    } finally {
      setSavingScore(null);
    }
  };

  const handleDecision = async () => {
    setActionLoading(true);
    try {
      if (decisionType === "approve") {
        await tprmService.approveQuestionnaire(questionnaireId, comment, user?.name);
      } else {
        await tprmService.rejectQuestionnaire(questionnaireId, comment, user?.name);
      }
      setShowDecision(false);
      await load();
      onRefreshStats?.();
    } catch (e) {
      alert(e.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const scoredCount = Object.keys(scores).length;
  const totalCount  = responses.length;
  const avgScore    = scoredCount > 0
    ? (Object.values(scores).reduce((a, b) => a + b, 0) / scoredCount).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Questionnaire not found</p>
        <button onClick={onBack} className="mt-3 text-blue-600 text-sm hover:underline">← Go back</button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[questionnaire.status] || STATUS_CONFIG.SUBMITTED;
  const StatusIcon = statusCfg.icon;
  const grouped = responses.reduce((acc, r) => {
    const key = `${r.topicNo}||${r.topicName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        className="bg-white/80 border border-slate-100 rounded-2xl p-5 shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors flex-shrink-0 mt-0.5"
          >
            <ArrowLeft size={16} className="text-slate-600" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-semibold text-slate-800">{questionnaire.title}</h2>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.cls}`}>
                <StatusIcon size={11} />
                {questionnaire.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User size={11} /> {questionnaire.vendorName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} /> Due: {questionnaire.dueDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> Submitted: {formatDate(questionnaire.submittedAt)}
              </span>
              {questionnaire.averageScore > 0 && (
                <span className="flex items-center gap-1 font-bold text-blue-600">
                  <Star size={11} /> Avg: {questionnaire.averageScore.toFixed(1)}/5
                </span>
              )}
            </div>
          </div>

          {/* Approve / Reject buttons */}
          {questionnaire.status === "SUBMITTED" && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => { setDecisionType("reject"); setShowDecision(true); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-200"
              >
                <XCircle size={13} /> Reject
              </button>
              <button
                onClick={() => { setDecisionType("approve"); setShowDecision(true); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow"
              >
                <CheckCircle size={13} /> Approve
              </button>
            </div>
          )}
        </div>

        {/* Scoring progress */}
        {questionnaire.status === "SUBMITTED" && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: totalCount > 0 ? `${(scoredCount / totalCount) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {scoredCount}/{totalCount} scored
              {avgScore !== "—" && ` · Avg: ${avgScore}/5`}
            </span>
          </div>
        )}

        {/* Admin comment (if reviewed) */}
        {questionnaire.adminComment && (
          <div className="mt-3 bg-slate-50 rounded-xl px-4 py-3">
            <p className="text-xs font-medium text-slate-500 mb-1">Admin Comment</p>
            <p className="text-sm text-slate-700">{questionnaire.adminComment}</p>
          </div>
        )}
      </motion.div>

      {/* Response table by topic */}
      {Object.entries(grouped)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([key, resps], gi) => {
          const [topicNo, topicName] = key.split("||");
          return (
            <motion.div
              key={key}
              className="bg-white/80 border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
            >
              {/* Topic header */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {topicNo}
                </div>
                <h4 className="text-sm font-semibold text-slate-800">{topicName}</h4>
                <span className="text-xs text-slate-400 ml-auto">{resps.length} question{resps.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Response rows */}
              <div className="divide-y divide-slate-50">
                {resps.map((r, ri) => {
                  const avCfg = AVAILABILITY_CONFIG[r.availability] || {};
                  const currentScore = scores[r.questionId];
                  const isSaving = savingScore === r.questionId;

                  return (
                    <div key={r.id} className="p-5">
                      {/* Question */}
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-xs font-bold text-slate-400 mt-0.5 w-5 flex-shrink-0">{ri + 1}.</span>
                        <p className="text-sm font-medium text-slate-800 flex-1">{r.questionText}</p>
                      </div>

                      {/* Vendor answers */}
                      <div className="ml-7 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        {/* Availability */}
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-medium text-slate-500 mb-1.5">Availability</p>
                          {r.availability ? (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg ${avCfg.cls}`}>
                              <div className={`w-2 h-2 rounded-full ${avCfg.dot}`} />
                              {r.availability}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Not answered</span>
                          )}
                        </div>

                        {/* Description */}
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-medium text-slate-500 mb-1.5">Description of Practice</p>
                          <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                            {r.descriptionOfPractice || <span className="text-slate-400 italic">Not provided</span>}
                          </p>
                        </div>

                        {/* Reference Doc */}
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-medium text-slate-500 mb-1.5">Reference Document</p>
                          {r.referenceDocumentName ? (
                            <Link
                              href={r.referenceDocumentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Download size={11} />
                              {r.referenceDocumentName}
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No file uploaded</span>
                          )}
                        </div>
                      </div>

                      {/* Admin scoring row */}
                      {questionnaire.status !== "DRAFT" && questionnaire.status !== "SENT" && (
                        <div className="ml-7 bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-xs font-semibold text-slate-600">Admin Score:</p>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map(v => (
                                <ScoreButton
                                  key={v}
                                  value={v}
                                  selected={currentScore === v}
                                  onClick={(val) => handleScoreClick(r.questionId, val)}
                                />
                              ))}
                            </div>
                            {isSaving && (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            )}
                            {currentScore && !isSaving && (
                              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg">
                                {currentScore}/5
                              </span>
                            )}
                          </div>

                          {/* Admin remark */}
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="Add remark (optional)..."
                              value={remarks[r.questionId] || ""}
                              onChange={e => setRemarks(prev => ({ ...prev, [r.questionId]: e.target.value }))}
                              onBlur={() => handleRemarkBlur(r.questionId)}
                              className="w-full text-xs border border-blue-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

      {/* Empty state */}
      {responses.length === 0 && (
        <div className="bg-white/70 border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <FileText size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No responses yet</p>
          <p className="text-slate-400 text-sm mt-1">The vendor hasn't submitted answers yet</p>
        </div>
      )}

      {/* Approve / Reject Modal */}
      {showDecision && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                ${decisionType === "approve" ? "bg-emerald-100" : "bg-red-100"}`}>
                {decisionType === "approve"
                  ? <CheckCircle size={20} className="text-emerald-600" />
                  : <XCircle size={20} className="text-red-600" />
                }
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 capitalize">
                  {decisionType} Questionnaire
                </h3>
                <p className="text-xs text-slate-500">{questionnaire.title}</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                Comment (optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={decisionType === "approve"
                  ? "e.g. All controls verified and satisfactory"
                  : "e.g. Missing documentation for encryption controls"
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDecision(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecision}
                disabled={actionLoading}
                className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-xl shadow transition-all disabled:opacity-60 flex items-center justify-center gap-2
                  ${decisionType === "approve"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  }`}
              >
                {actionLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : decisionType === "approve" ? <CheckCircle size={15} /> : <XCircle size={15} />
                }
                {actionLoading ? "Processing..." : `Confirm ${decisionType === "approve" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReviewScreen;
