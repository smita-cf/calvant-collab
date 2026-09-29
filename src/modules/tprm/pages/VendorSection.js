import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ClipboardList, CheckCircle, Clock,
  XCircle, Send, RefreshCw, ChevronRight, FileText,
  AlertCircle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import tprmService from "../services/tprmService";
import VendorAnswerForm from "../components/VendorAnswerFormComponent";

const STATUS_CONFIG = {
  SENT:         { label: "Pending Answer",  cls: "bg-blue-100 text-blue-700",       dot: "#3b82f6", icon: Send },
  SUBMITTED:    { label: "Submitted",       cls: "bg-amber-100 text-amber-700",     dot: "#f59e0b", icon: Clock },
  UNDER_REVIEW: { label: "Under Review",    cls: "bg-violet-100 text-violet-700",   dot: "#8b5cf6", icon: Clock },
  RESUBMITTED:  { label: "Resubmitted",     cls: "bg-orange-100 text-orange-700",   dot: "#f97316", icon: Clock },
  APPROVED:     { label: "Approved",        cls: "bg-emerald-100 text-emerald-700", dot: "#10b981", icon: CheckCircle },
  REJECTED:     { label: "Rejected",        cls: "bg-red-100 text-red-700",         dot: "#ef4444", icon: XCircle },
};

const VendorSection = () => {
  const router = useRouter();
  const [user] = useState(() => JSON.parse(sessionStorage.getItem("user")));
  const vendorId = user?._id || user?.id;
  const userName = user?.name || "Vendor";

  const [questionnaires, setQuestionnaires] = useState([]);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  const [loading,        setLoading]        = useState(true);
  const [activeForm,     setActiveForm]     = useState(null); // questionnaireId
  const [statusFilter,   setStatusFilter]   = useState("All");

  useEffect(() => { if (!user) router.push("/"); }, [user, router]);

  const load = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const data = await tprmService.getVendorQuestionnaires(vendorId);
      setQuestionnaires(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { load(); }, [load]);

  // Stats derived from questionnaires
  const stats = questionnaires.reduce(
    (acc, q) => {
      acc.total++;
      const s = q.status?.toLowerCase();
      if (s === "sent")      acc.pending++;
      if (s === "submitted") acc.submitted++;
      if (s === "approved")  acc.approved++;
      if (s === "rejected")  acc.rejected++;
      return acc;
    },
    { total: 0, pending: 0, submitted: 0, approved: 0, rejected: 0 }
  );

  const pieData = [
    { name: "Pending",   value: stats.pending,   color: "#3b82f6" },
    { name: "Submitted", value: stats.submitted,  color: "#f59e0b" },
    { name: "Approved",  value: stats.approved,   color: "#10b981" },
    { name: "Rejected",  value: stats.rejected,   color: "#ef4444" },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: "Total",     value: stats.total,     color: "from-indigo-400 to-indigo-500", icon: ClipboardList },
    { label: "Pending",   value: stats.pending,   color: "from-blue-400 to-blue-500",     icon: Send },
    { label: "Submitted", value: stats.submitted,  color: "from-amber-400 to-amber-500",  icon: Clock },
    { label: "Approved",  value: stats.approved,   color: "from-emerald-400 to-emerald-500", icon: CheckCircle },
    { label: "Rejected",  value: stats.rejected,   color: "from-red-400 to-red-500",      icon: XCircle },
  ];

  const filtered = questionnaires.filter(q =>
    statusFilter === "All" || q.status === statusFilter
  );

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const diff = new Date(dueDate) - new Date();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === "SUBMITTED" || status === "APPROVED") return false;
    return new Date(dueDate) < new Date();
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg">
          <p className="font-semibold text-slate-800 text-sm">{d.name}</p>
          <p className="text-2xl font-bold text-slate-900">{d.value}</p>
        </div>
      );
    }
    return null;
  };

  // If vendor is answering a questionnaire
  if (activeForm) {
    return (
      <VendorAnswerForm
        user={user}
        questionnaireId={activeForm}
        onBack={() => { setActiveForm(null); load(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24">

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.header
          className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-md mb-6 p-5"
          initial={hasMounted ? { opacity: 0, y: -15 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg p-3">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">
                  Third Party Risk Assessment
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full text-xs mr-2">
                    Vendor
                  </span>
                  {userName} &nbsp;·&nbsp;
                  <span className="font-bold text-slate-700">{stats.total}</span> assessments assigned
                </p>
              </div>
            </div>
            <button
              onClick={load}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw size={18} className="text-slate-600" />
            </button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* ── Left Column ─────────────────────────────────── */}
          <div className="space-y-6">

            {/* Stat Cards */}
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {statCards.map(({ label, value, color, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  className="bg-white/70 border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-white flex items-center gap-3"
                  initial={hasMounted ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setStatusFilter(label === "Total" ? "All" : label.toUpperCase())}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <Icon size={17} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-800 leading-tight">{value}</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                  </div>
                </motion.div>
              ))}
            </section>

            {/* Assigned Assessments Card */}
            <motion.div
              className="bg-white/80 border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
              initial={hasMounted ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <ClipboardList size={15} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">Assessments</h3>
                </div>

                {/* Status filter pills */}
                <div className="flex gap-1 flex-wrap">
                  {["All", "SENT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                        ${statusFilter === s
                          ? s === "REJECTED" ? "bg-red-600 text-white" : "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                    >
                      {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                  <FileText size={36} className="text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No assessments found</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {statusFilter === "All"
                      ? "You have no assessments assigned yet"
                      : `No ${statusFilter.toLowerCase()} assessments`
                    }
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="divide-y divide-slate-50">
                    {filtered.map((q, i) => {
                      const cfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.SENT;
                      const StatusIcon = cfg.icon;
                      const dueSoon = isDueSoon(q.dueDate);
                      const overdue = isOverdue(q.dueDate, q.status);
                      const canAnswer = q.status === "SENT" || q.status === "UNDER_REVIEW";

                      return (
                        <motion.div
                          key={q.id}
                          className={`flex items-center gap-4 px-5 py-4 transition-colors
                            ${canAnswer ? "hover:bg-indigo-50/50 cursor-pointer" : "hover:bg-slate-50/50"}`}
                          initial={hasMounted ? { opacity: 0, x: -10 } : false}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => canAnswer && setActiveForm(q.id)}
                        >
                          {/* Status dot */}
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.dot }} />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <h4 className="text-sm font-semibold text-slate-800 truncate">{q.title}</h4>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.cls}`}>
                                <StatusIcon size={10} />
                                {cfg.label}
                              </span>
                              {overdue && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                                  <AlertCircle size={10} /> Overdue
                                </span>
                              )}
                              {dueSoon && !overdue && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                  Due Soon
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 text-xs text-slate-500">
                              <span>Due: <span className={`font-medium ${overdue ? "text-red-500" : "text-slate-700"}`}>{q.dueDate || "—"}</span></span>
                              <span>{q.totalQuestions ?? q.questionIds?.length ?? 0} questions</span>
                              {q.averageScore > 0 && (
                                <span className="text-blue-600 font-semibold">Score: {q.averageScore.toFixed(1)}/5</span>
                              )}
                            </div>
                            {/* Show admin rejection reason */}
                            {q.status === "REJECTED" && q.adminComment && (
                              <div className="mt-1.5 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                                <span className="text-xs font-semibold text-red-600 flex-shrink-0">Rejection Reason:</span>
                                <p className="text-xs text-red-700">{q.adminComment}</p>
                              </div>
                            )}
                          </div>

                          {/* Action */}
                          {canAnswer && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                                {q.status === "UNDER_REVIEW" ? "Re-answer" : "Answer"}
                              </span>
                              <ChevronRight size={16} className="text-indigo-400" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              )}
            </motion.div>
          </div>

          {/* ── Right Column — Chart ─────────────────────────── */}
          <div className="space-y-6">
            <motion.div
              className="bg-white/70 border border-slate-100 rounded-2xl p-6 shadow-lg h-72 flex flex-col"
              initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-base font-semibold text-slate-800 mb-4">Assessment Status</h3>
              <div className="flex-1 flex items-center justify-center">
                {stats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                        stroke="white"
                        strokeWidth={3}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-600 text-sm">Total</text>
                      <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 text-2xl font-bold">{stats.total}</text>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Shield size={40} className="text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No assessments yet</p>
                    <p className="text-slate-400 text-sm mt-1">Assessments assigned to you will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Legend */}
            <motion.div
              className="bg-white/70 border border-slate-100 rounded-xl p-4 shadow-sm"
              initial={hasMounted ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Status Guide</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Pending Answer", desc: "Admin has sent you a questionnaire to fill", color: "#3b82f6" },
                  { label: "Submitted",      desc: "You submitted — admin is reviewing",         color: "#f59e0b" },
                  { label: "Approved",       desc: "Admin has approved your submission",          color: "#10b981" },
                  { label: "Rejected",       desc: "Admin has rejected — check comments",         color: "#ef4444" },
                ].map(({ label, desc, color }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: color }} />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-lg px-6 py-4 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-slate-600 font-medium">© {new Date().getFullYear()} CalVant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default VendorSection;
