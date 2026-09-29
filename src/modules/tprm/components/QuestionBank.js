import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, Trash2, Edit3, Check, X,
  Shield, Lock, Database, FileText, Globe, DollarSign
} from "lucide-react";
import tprmService from "../services/tprmService";

const CATEGORY_ICONS = {
  "Cybersecurity":         Shield,
  "Data Privacy":          Lock,
  "Operational Resilience":Database,
  "Legal & Compliance":    FileText,
  "Financial Stability":   DollarSign,
};

const CATEGORY_COLORS = {
  "Cybersecurity":          "from-blue-400 to-blue-500",
  "Data Privacy":           "from-purple-400 to-purple-500",
  "Operational Resilience": "from-emerald-400 to-emerald-500",
  "Legal & Compliance":     "from-amber-400 to-amber-500",
  "Financial Stability":    "from-rose-400 to-rose-500",
};

const AVAILABILITY_BADGE = {
  SYSTEM: { label: "System", cls: "bg-blue-100 text-blue-700" },
  ORG:    { label: "Custom", cls: "bg-purple-100 text-purple-700" },
};

const QuestionBank = ({ user, organization }) => {
  const [questions,  setQuestions]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [catFilter,  setCatFilter]  = useState("All");
  const [showForm,   setShowForm]   = useState(false);
  const [editQ,      setEditQ]      = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  const [form, setForm] = useState({
    topicNo: "", topicName: "", text: "", category: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tprmService.getQuestions(organization);
      setQuestions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => { load(); }, [load]);

  const categories = ["All", ...new Set(questions.map(q => q.category).filter(Boolean))];

  const filtered = questions.filter(q => {
    const matchSearch = search === "" ||
      q.text?.toLowerCase().includes(search.toLowerCase()) ||
      q.topicName?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || q.category === catFilter;
    return matchSearch && matchCat;
  });

  // Group by topicNo
  const grouped = filtered.reduce((acc, q) => {
    const key = `${q.topicNo}||${q.topicName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  const openCreate = () => {
    setEditQ(null);
    setForm({ topicNo: "", topicName: "", text: "", category: "" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (q) => {
    if (q.createdBy === "SYSTEM") return;
    setEditQ(q);
    setForm({ topicNo: q.topicNo, topicName: q.topicName, text: q.text, category: q.category || "" });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.text.trim())      return setError("Question text is required");
    if (!form.topicName.trim()) return setError("Topic name is required");
    if (!form.topicNo || form.topicNo <= 0) return setError("Topic number must be > 0");

    setSaving(true);
    setError("");
    try {
      if (editQ) {
        await tprmService.updateQuestion(editQ.id, form, organization);
      } else {
        await tprmService.createQuestion(
          { ...form, topicNo: parseInt(form.topicNo) },
          user?._id || user?.id || "admin",
          organization
        );
      }
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q) => {
    if (q.createdBy === "SYSTEM") return;
    if (!window.confirm("Deactivate this question?")) return;
    await tprmService.deleteQuestion(q.id, organization);
    await load();
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions or topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${catFilter === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <Plus size={15} />
          Add Question
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="bg-white/70 border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm text-sm">
          <span className="font-bold text-slate-800">{questions.length}</span>
          <span className="text-slate-500 ml-1">total questions</span>
        </div>
        <div className="bg-white/70 border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm text-sm">
          <span className="font-bold text-blue-600">{questions.filter(q => q.createdBy === "SYSTEM").length}</span>
          <span className="text-slate-500 ml-1">system</span>
        </div>
        <div className="bg-white/70 border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm text-sm">
          <span className="font-bold text-purple-600">{questions.filter(q => q.createdBy !== "SYSTEM").length}</span>
          <span className="text-slate-500 ml-1">custom</span>
        </div>
      </div>

      {/* Question groups */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white/70 border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No questions found</p>
          <p className="text-slate-400 text-sm mt-1">Add questions or adjust your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([key, qs], gi) => {
              const [topicNo, topicName] = key.split("||");
              const cat = qs[0]?.category;
              const Icon = CATEGORY_ICONS[cat] || Globe;
              const color = CATEGORY_COLORS[cat] || "from-slate-400 to-slate-500";

              return (
                <motion.div
                  key={key}
                  className="bg-white/80 border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.05 }}
                >
                  {/* Topic header */}
                  <div className="flex items-center gap-3 px-5 py-3 bg-slate-50/80 border-b border-slate-100">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <Icon size={14} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Topic {topicNo}</span>
                      <h4 className="text-sm font-semibold text-slate-800">{topicName}</h4>
                    </div>
                    {cat && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{cat}</span>
                    )}
                    <span className="text-xs text-slate-400">{qs.length} question{qs.length !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Questions */}
                  <div className="divide-y divide-slate-50">
                    {qs.map((q, qi) => {
                      const badge = q.createdBy === "SYSTEM" ? AVAILABILITY_BADGE.SYSTEM : AVAILABILITY_BADGE.ORG;
                      return (
                        <div key={q.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors group">
                          <span className="text-xs font-bold text-slate-400 mt-0.5 w-5 flex-shrink-0">{qi + 1}.</span>
                          <p className="flex-1 text-sm text-slate-700 leading-relaxed">{q.text}</p>
                          <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                            {q.createdBy !== "SYSTEM" && (
                              <>
                                <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors">
                                  <Edit3 size={13} />
                                </button>
                                <button onClick={() => handleDelete(q)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-800">
                  {editQ ? "Edit Question" : "Add Question"}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Topic No. *</label>
                    <input
                      type="number"
                      min="1"
                      value={form.topicNo}
                      onChange={e => setForm(f => ({ ...f, topicNo: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="e.g. 1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Topic Name *</label>
                    <input
                      type="text"
                      value={form.topicName}
                      onChange={e => setForm(f => ({ ...f, topicName: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="e.g. Encryption"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Question Text *</label>
                  <textarea
                    rows={3}
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                    placeholder="Enter the question..."
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  >
                    <option value="">Select category (optional)</option>
                    <option>Cybersecurity</option>
                    <option>Data Privacy</option>
                    <option>Operational Resilience</option>
                    <option>Legal & Compliance</option>
                    <option>Financial Stability</option>
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  {saving ? "Saving..." : "Save Question"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionBank;