// import React, { useState, useEffect, useCallback } from "react";
// import { motion } from "framer-motion";
// import {
//   Plus, Search, Check, X, ChevronDown, ChevronUp,
//   User, Calendar, FileText, Shield
// } from "lucide-react";
// import tprmService from "../services/tprmService";

// const CreateQuestionnaire = ({ user, organization, onCreated }) => {
//   const [questions,      setQuestions]      = useState([]);
//   const [vendors,        setVendors]        = useState([]);
//   const [selectedQIds,   setSelectedQIds]   = useState([]);
//   const [search,         setSearch]         = useState("");
//   const [catFilter,      setCatFilter]      = useState("All");
//   const [expandedTopics, setExpandedTopics] = useState({});
//   const [saving,         setSaving]         = useState(false);
//   const [error,          setError]          = useState("");
//   const [step,           setStep]           = useState(1); // 1=details, 2=questions

//   const [form, setForm] = useState({
//     title:       "",
//     vendorId:    "",
//     vendorName:  "",
//     vendorEmail: "",
//     dueDate:     "",
//   });

//   // Load questions and vendors
//   const loadData = useCallback(async () => {
//     const [qs, users] = await Promise.all([
//       tprmService.getQuestions(organization),
//       fetchVendors(),
//     ]);
//     setQuestions(Array.isArray(qs) ? qs : []);
//     setVendors(Array.isArray(users) ? users : []);
//   }, [organization]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const fetchVendors = async () => {
//     try {
//       // Fetch users with vendor role from user-service
//       const base = process.env.NEXT_PUBLIC_SP;
//       const res = await fetch(
//         `${base}/user-service/api/users?organization=${organization}`
//       );
//       if (!res.ok) return [];
//       const data = await res.json();
//       return Array.isArray(data)
//         ? data.filter(u => {
//             const roles = Array.isArray(u.role) ? u.role : [u.role];
//             return roles.includes("user");
//           })
//         : [];
//     } catch {
//       return [];
//     }
//   };

//   const categories = ["All", ...new Set(questions.map(q => q.category).filter(Boolean))];

//   const filtered = questions.filter(q => {
//     const matchSearch = search === "" ||
//       q.text?.toLowerCase().includes(search.toLowerCase()) ||
//       q.topicName?.toLowerCase().includes(search.toLowerCase());
//     const matchCat = catFilter === "All" || q.category === catFilter;
//     return matchSearch && matchCat;
//   });

//   const grouped = filtered.reduce((acc, q) => {
//     const key = `${q.topicNo}||${q.topicName}`;
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(q);
//     return acc;
//   }, {});

//   const toggleQuestion = (id) => {
//     setSelectedQIds(prev =>
//       prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
//     );
//   };

//   const toggleTopic = (key, qs) => {
//     const ids = qs.map(q => q.id);
//     const allSelected = ids.every(id => selectedQIds.includes(id));
//     if (allSelected) {
//       setSelectedQIds(prev => prev.filter(id => !ids.includes(id)));
//     } else {
//       setSelectedQIds(prev => [...new Set([...prev, ...ids])]);
//     }
//   };

//   const toggleTopicExpand = (key) => {
//     setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   const handleVendorChange = (e) => {
//     const selected = vendors.find(v => v._id === e.target.value);
//     if (selected) {
//       setForm(f => ({
//         ...f,
//         vendorId:    selected._id,
//         vendorName:  selected.name,
//         vendorEmail: selected.email || "",
//       }));
//     } else {
//       setForm(f => ({ ...f, vendorId: "", vendorName: "", vendorEmail: "" }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!form.title.trim())   return setError("Title is required");
//     if (!form.vendorId)       return setError("Please select a vendor");
//     if (!form.dueDate)        return setError("Due date is required");
//     if (selectedQIds.length === 0) return setError("Select at least one question");

//     setSaving(true);
//     setError("");
//     try {
//       const payload = {
//         ...form,
//         organization,
//         questionIds:    selectedQIds,
//         createdBy:      user?._id || user?.id,
//         createdByName:  user?.name,
//       };
//       await tprmService.createQuestionnaire(payload);
//       onCreated?.();
//     } catch (e) {
//       setError(e.message || "Failed to create questionnaire");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const today = new Date().toISOString().split("T")[0];

//   return (
//     <div className="space-y-5">
//       {/* Header card */}
//       <div className="bg-white/80 border border-slate-100 rounded-2xl p-5 shadow-sm">
//         <div className="flex items-center gap-3 mb-1">
//           <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
//             <Plus size={18} className="text-white" />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-slate-800">New Vendor Assessment</h2>
//             <p className="text-sm text-slate-500">Fill in details and select questions</p>
//           </div>
//         </div>

//         {/* Step indicator */}
//         <div className="flex gap-2 mt-4">
//           {["Assessment Details", "Select Questions"].map((label, i) => (
//             <button
//               key={i}
//               onClick={() => setStep(i + 1)}
//               className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all
//                 ${step === i + 1
//                   ? "bg-blue-600 text-white"
//                   : "bg-slate-100 text-slate-500 hover:bg-slate-200"
//                 }`}
//             >
//               <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold
//                 ${step === i + 1 ? "bg-white text-blue-600" : "bg-slate-300 text-white"}`}>
//                 {i + 1}
//               </span>
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Step 1 — Details */}
//       {step === 1 && (
//         <motion.div
//           className="bg-white/80 border border-slate-100 rounded-2xl p-6 shadow-sm"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <h3 className="text-base font-semibold text-slate-800 mb-5">Assessment Details</h3>
//           <div className="space-y-4 max-w-lg">

//             <div>
//               <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
//                 <FileText size={12} /> Assessment Title *
//               </label>
//               <input
//                 type="text"
//                 value={form.title}
//                 onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
//                 placeholder="e.g. Q1 2025 Vendor Security Assessment"
//               />
//             </div>

//             <div>
//               <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
//                 <User size={12} /> Assign to Vendor *
//               </label>
//               <select
//                 value={form.vendorId}
//                 onChange={handleVendorChange}
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
//               >
//                 <option value="">Select vendor...</option>
//                 {vendors.map(v => (
//                   <option key={v._id} value={v._id}>{v.name} — {v.email}</option>
//                 ))}
//               </select>
//               {vendors.length === 0 && (
//                 <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 rounded-lg px-3 py-1.5">
//                   No vendors found. Make sure users with "vendor" role exist in your organization.
//                 </p>
//               )}
//               {form.vendorName && (
//                 <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
//                   <Check size={11} /> Selected: {form.vendorName} ({form.vendorEmail})
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
//                 <Calendar size={12} /> Due Date *
//               </label>
//               <input
//                 type="date"
//                 min={today}
//                 value={form.dueDate}
//                 onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
//               />
//             </div>
//           </div>

//           <button
//             onClick={() => {
//               if (!form.title.trim()) return setError("Title is required");
//               if (!form.vendorId)     return setError("Please select a vendor");
//               if (!form.dueDate)      return setError("Due date is required");
//               setError("");
//               setStep(2);
//             }}
//             className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md hover:-translate-y-0.5 transition-all"
//           >
//             Next: Select Questions →
//           </button>
//           {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
//         </motion.div>
//       )}

//       {/* Step 2 — Select Questions */}
//       {step === 2 && (
//         <motion.div
//           className="space-y-4"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           {/* Filter toolbar */}
//           <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
//             <div className="relative flex-1 min-w-48">
//               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search questions..."
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
//               />
//             </div>
//             <div className="flex gap-1 flex-wrap">
//               {categories.map(cat => (
//                 <button
//                   key={cat}
//                   onClick={() => setCatFilter(cat)}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
//                     ${catFilter === cat ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//             <div className="text-sm text-slate-600 font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
//               {selectedQIds.length} selected
//             </div>
//           </div>

//           {/* Question groups */}
//           <div className="space-y-3">
//             {Object.entries(grouped)
//               .sort(([a], [b]) => parseInt(a) - parseInt(b))
//               .map(([key, qs]) => {
//                 const [topicNo, topicName] = key.split("||");
//                 const ids = qs.map(q => q.id);
//                 const allSel = ids.every(id => selectedQIds.includes(id));
//                 const someSel = ids.some(id => selectedQIds.includes(id));
//                 const isExpanded = expandedTopics[key] !== false; // default expanded

//                 return (
//                   <div key={key} className="bg-white/80 border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
//                     {/* Topic row */}
//                     <div
//                       className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
//                       onClick={() => toggleTopicExpand(key)}
//                     >
//                       {/* Select all toggle */}
//                       <button
//                         onClick={e => { e.stopPropagation(); toggleTopic(key, qs); }}
//                         className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all
//                           ${allSel
//                             ? "bg-blue-600 border-blue-600"
//                             : someSel
//                             ? "bg-blue-200 border-blue-400"
//                             : "bg-white border-slate-300"
//                           }`}
//                       >
//                         {allSel && <Check size={11} className="text-white" />}
//                         {someSel && !allSel && <div className="w-2 h-2 bg-blue-500 rounded-sm" />}
//                       </button>

//                       <div className="flex-1">
//                         <span className="text-xs text-slate-500 font-medium">Topic {topicNo}</span>
//                         <h4 className="text-sm font-semibold text-slate-800">{topicName}</h4>
//                       </div>
//                       <span className="text-xs text-slate-400">{qs.length} questions</span>
//                       {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
//                     </div>

//                     {/* Questions */}
//                     {isExpanded && (
//                       <div className="divide-y divide-slate-50">
//                         {qs.map((q, qi) => {
//                           const isSel = selectedQIds.includes(q.id);
//                           return (
//                             <div
//                               key={q.id}
//                               className={`flex items-start gap-3 px-5 py-3 cursor-pointer transition-colors
//                                 ${isSel ? "bg-blue-50/50" : "hover:bg-slate-50/50"}`}
//                               onClick={() => toggleQuestion(q.id)}
//                             >
//                               <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
//                                 ${isSel ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"}`}>
//                                 {isSel && <Check size={11} className="text-white" />}
//                               </div>
//                               <span className="text-xs text-slate-400 mt-0.5 w-4 flex-shrink-0">{qi + 1}.</span>
//                               <p className="text-sm text-slate-700 flex-1 leading-relaxed">{q.text}</p>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//           </div>

//           {/* Summary + Submit */}
//           <div className="bg-white/80 border border-slate-100 rounded-2xl p-5 shadow-sm">
//             <h3 className="text-sm font-semibold text-slate-800 mb-3">Assessment Summary</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
//               {[
//                 { label: "Title",     value: form.title || "—" },
//                 { label: "Vendor",    value: form.vendorName || "—" },
//                 { label: "Due Date",  value: form.dueDate || "—" },
//                 { label: "Questions", value: `${selectedQIds.length} selected` },
//               ].map(({ label, value }) => (
//                 <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5">
//                   <p className="text-xs text-slate-500 font-medium">{label}</p>
//                   <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</p>
//                 </div>
//               ))}
//             </div>

//             {error && (
//               <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
//             )}

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setStep(1)}
//                 className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
//               >
//                 ← Back
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={saving || selectedQIds.length === 0}
//                 className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
//               >
//                 {saving ? (
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 ) : (
//                   <Shield size={15} />
//                 )}
//                 {saving ? "Creating..." : "Create as Draft"}
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default CreateQuestionnaire;

//Assigne to all User for Testingimport 

// import React, { useState, useEffect, useCallback } from "react";
// import { motion } from "framer-motion";
// import {
//   Plus, Search, Check, X, ChevronDown, ChevronUp,
//   User, Calendar, FileText, Shield
// } from "lucide-react";
// import tprmService from "../services/tprmService";

// const CreateQuestionnaire = ({ user, organization, onCreated }) => {
//   const [questions,      setQuestions]      = useState([]);
//   const [vendors,        setVendors]        = useState([]);
//   const [selectedQIds,   setSelectedQIds]   = useState([]);
//   const [search,         setSearch]         = useState("");
//   const [catFilter,      setCatFilter]      = useState("All");
//   const [expandedTopics, setExpandedTopics] = useState({});
//   const [saving,         setSaving]         = useState(false);
//   const [error,          setError]          = useState("");
//   const [step,           setStep]           = useState(1); // 1=details, 2=questions

//   const [form, setForm] = useState({
//     title:       "",
//     vendorId:    "",
//     vendorName:  "",
//     vendorEmail: "",
//     dueDate:     "",
//   });

//   // Load questions and vendors
//   const loadData = useCallback(async () => {
//     const [qs, users] = await Promise.all([
//       tprmService.getQuestions(organization),
//       fetchVendors(),
//     ]);
//     setQuestions(Array.isArray(qs) ? qs : []);
//     setVendors(Array.isArray(users) ? users : []);
//   }, [organization]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const fetchVendors = async () => {
//     try {
//       const token = sessionStorage.getItem("token");
//       const res = await fetch(
//         `http://localhost:4000/api/users?organization=${organization}`,
//         {
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           }
//         }
//       );
//       if (!res.ok) return [];
//       const data = await res.json();
//       // TODO: filter by role "user" in production
//       // For testing — show ALL users in the organization
//       return Array.isArray(data) ? data : [];
//     } catch (err) {
//       console.error("Error fetching users:", err);
//       return [];
//     }
//   };

//   const categories = ["All", ...new Set(questions.map(q => q.category).filter(Boolean))];

//   const filtered = questions.filter(q => {
//     const matchSearch = search === "" ||
//       q.text?.toLowerCase().includes(search.toLowerCase()) ||
//       q.topicName?.toLowerCase().includes(search.toLowerCase());
//     const matchCat = catFilter === "All" || q.category === catFilter;
//     return matchSearch && matchCat;
//   });

//   const grouped = filtered.reduce((acc, q) => {
//     const key = `${q.topicNo}||${q.topicName}`;
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(q);
//     return acc;
//   }, {});

//   const toggleQuestion = (id) => {
//     setSelectedQIds(prev =>
//       prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
//     );
//   };

//   const toggleTopic = (key, qs) => {
//     const ids = qs.map(q => q.id);
//     const allSelected = ids.every(id => selectedQIds.includes(id));
//     if (allSelected) {
//       setSelectedQIds(prev => prev.filter(id => !ids.includes(id)));
//     } else {
//       setSelectedQIds(prev => [...new Set([...prev, ...ids])]);
//     }
//   };

//   const toggleTopicExpand = (key) => {
//     setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   const handleVendorChange = (e) => {
//     const val = e.target.value;
//     const selected = vendors.find(v => (v._id || v.id) === val);
//     if (selected) {
//       setForm(f => ({
//         ...f,
//         vendorId:    selected._id || selected.id,
//         vendorName:  selected.name || selected.username || "",
//         vendorEmail: selected.email || "",
//       }));
//     } else {
//       setForm(f => ({ ...f, vendorId: "", vendorName: "", vendorEmail: "" }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!form.title.trim())   return setError("Title is required");
//     if (!form.vendorId)       return setError("Please select a vendor");
//     if (!form.dueDate)        return setError("Due date is required");
//     if (selectedQIds.length === 0) return setError("Select at least one question");

//     setSaving(true);
//     setError("");
//     try {
//       const payload = {
//         ...form,
//         organization,
//         questionIds:    selectedQIds,
//         createdBy:      user?._id || user?.id,
//         createdByName:  user?.name,
//       };
//       await tprmService.createQuestionnaire(payload);
//       onCreated?.();
//     } catch (e) {
//       setError(e.message || "Failed to create questionnaire");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const today = new Date().toISOString().split("T")[0];

//   return (
//     <div className="space-y-5">
//       {/* Header card */}
//       <div className="bg-white/80 border border-slate-100 rounded-2xl p-5 shadow-sm">
//         <div className="flex items-center gap-3 mb-1">
//           <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
//             <Plus size={18} className="text-white" />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-slate-800">New Vendor Assessment</h2>
//             <p className="text-sm text-slate-500">Fill in details and select questions</p>
//           </div>
//         </div>

//         {/* Step indicator */}
//         <div className="flex gap-2 mt-4">
//           {["Assessment Details", "Select Questions"].map((label, i) => (
//             <button
//               key={i}
//               onClick={() => setStep(i + 1)}
//               className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all
//                 ${step === i + 1
//                   ? "bg-blue-600 text-white"
//                   : "bg-slate-100 text-slate-500 hover:bg-slate-200"
//                 }`}
//             >
//               <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold
//                 ${step === i + 1 ? "bg-white text-blue-600" : "bg-slate-300 text-white"}`}>
//                 {i + 1}
//               </span>
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Step 1 — Details */}
//       {step === 1 && (
//         <motion.div
//           className="bg-white/80 border border-slate-100 rounded-2xl p-6 shadow-sm"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <h3 className="text-base font-semibold text-slate-800 mb-5">Assessment Details</h3>
//           <div className="space-y-4 max-w-lg">

//             <div>
//               <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
//                 <FileText size={12} /> Assessment Title *
//               </label>
//               <input
//                 type="text"
//                 value={form.title}
//                 onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
//                 placeholder="e.g. Q1 2025 Vendor Security Assessment"
//               />
//             </div>

//             <div>
//               <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
//                 <User size={12} /> Assign to Vendor *
//               </label>
//               <select
//                 value={form.vendorId}
//                 onChange={handleVendorChange}
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
//               >
//                 <option value="">Select vendor...</option>
//                 {vendors.map(v => (
//                   <option key={v._id || v.id} value={v._id || v.id}>
//                     {v.name || v.username} — {v.email}
//                   </option>
//                 ))}
//               </select>
//               {vendors.length === 0 && (
//                 <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 rounded-lg px-3 py-1.5">
//                   No vendors found. Make sure users with "vendor" role exist in your organization.
//                 </p>
//               )}
//               {form.vendorName && (
//                 <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
//                   <Check size={11} /> Selected: {form.vendorName} ({form.vendorEmail})
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
//                 <Calendar size={12} /> Due Date *
//               </label>
//               <input
//                 type="date"
//                 min={today}
//                 value={form.dueDate}
//                 onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
//               />
//             </div>
//           </div>

//           <button
//             onClick={() => {
//               if (!form.title.trim()) return setError("Title is required");
//               if (!form.vendorId)     return setError("Please select a vendor");
//               if (!form.dueDate)      return setError("Due date is required");
//               setError("");
//               setStep(2);
//             }}
//             className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md hover:-translate-y-0.5 transition-all"
//           >
//             Next: Select Questions →
//           </button>
//           {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
//         </motion.div>
//       )}

//       {/* Step 2 — Select Questions */}
//       {step === 2 && (
//         <motion.div
//           className="space-y-4"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           {/* Filter toolbar */}
//           <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
//             <div className="relative flex-1 min-w-48">
//               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search questions..."
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
//               />
//             </div>
//             <div className="flex gap-1 flex-wrap">
//               {categories.map(cat => (
//                 <button
//                   key={cat}
//                   onClick={() => setCatFilter(cat)}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
//                     ${catFilter === cat ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//             <div className="text-sm text-slate-600 font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
//               {selectedQIds.length} selected
//             </div>
//           </div>

//           {/* Question groups */}
//           <div className="space-y-3">
//             {Object.entries(grouped)
//               .sort(([a], [b]) => parseInt(a) - parseInt(b))
//               .map(([key, qs]) => {
//                 const [topicNo, topicName] = key.split("||");
//                 const ids = qs.map(q => q.id);
//                 const allSel = ids.every(id => selectedQIds.includes(id));
//                 const someSel = ids.some(id => selectedQIds.includes(id));
//                 const isExpanded = expandedTopics[key] !== false; // default expanded

//                 return (
//                   <div key={key} className="bg-white/80 border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
//                     {/* Topic row */}
//                     <div
//                       className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
//                       onClick={() => toggleTopicExpand(key)}
//                     >
//                       {/* Select all toggle */}
//                       <button
//                         onClick={e => { e.stopPropagation(); toggleTopic(key, qs); }}
//                         className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all
//                           ${allSel
//                             ? "bg-blue-600 border-blue-600"
//                             : someSel
//                             ? "bg-blue-200 border-blue-400"
//                             : "bg-white border-slate-300"
//                           }`}
//                       >
//                         {allSel && <Check size={11} className="text-white" />}
//                         {someSel && !allSel && <div className="w-2 h-2 bg-blue-500 rounded-sm" />}
//                       </button>

//                       <div className="flex-1">
//                         <span className="text-xs text-slate-500 font-medium">Topic {topicNo}</span>
//                         <h4 className="text-sm font-semibold text-slate-800">{topicName}</h4>
//                       </div>
//                       <span className="text-xs text-slate-400">{qs.length} questions</span>
//                       {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
//                     </div>

//                     {/* Questions */}
//                     {isExpanded && (
//                       <div className="divide-y divide-slate-50">
//                         {qs.map((q, qi) => {
//                           const isSel = selectedQIds.includes(q.id);
//                           return (
//                             <div
//                               key={q.id}
//                               className={`flex items-start gap-3 px-5 py-3 cursor-pointer transition-colors
//                                 ${isSel ? "bg-blue-50/50" : "hover:bg-slate-50/50"}`}
//                               onClick={() => toggleQuestion(q.id)}
//                             >
//                               <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
//                                 ${isSel ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"}`}>
//                                 {isSel && <Check size={11} className="text-white" />}
//                               </div>
//                               <span className="text-xs text-slate-400 mt-0.5 w-4 flex-shrink-0">{qi + 1}.</span>
//                               <p className="text-sm text-slate-700 flex-1 leading-relaxed">{q.text}</p>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//           </div>

//           {/* Summary + Submit */}
//           <div className="bg-white/80 border border-slate-100 rounded-2xl p-5 shadow-sm">
//             <h3 className="text-sm font-semibold text-slate-800 mb-3">Assessment Summary</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
//               {[
//                 { label: "Title",     value: form.title || "—" },
//                 { label: "Vendor",    value: form.vendorName || "—" },
//                 { label: "Due Date",  value: form.dueDate || "—" },
//                 { label: "Questions", value: `${selectedQIds.length} selected` },
//               ].map(({ label, value }) => (
//                 <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5">
//                   <p className="text-xs text-slate-500 font-medium">{label}</p>
//                   <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</p>
//                 </div>
//               ))}
//             </div>

//             {error && (
//               <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
//             )}

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setStep(1)}
//                 className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
//               >
//                 ← Back
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={saving || selectedQIds.length === 0}
//                 className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
//               >
//                 {saving ? (
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 ) : (
//                   <Shield size={15} />
//                 )}
//                 {saving ? "Creating..." : "Create as Draft"}
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default CreateQuestionnaire;

// import React, { useState, useEffect, useCallback } from "react";
// import { motion } from "framer-motion";
// import {
//   Plus, Search, Check, ChevronDown, ChevronUp,
//   User, Calendar, FileText, Shield
// } from "lucide-react";
// import tprmService from "../services/tprmService";

// const CreateQuestionnaire = ({ user, organization, onCreated }) => {
//   const [questions,      setQuestions]      = useState([]);
//   const [vendors,        setVendors]        = useState([]);
//   const [selectedQIds,   setSelectedQIds]   = useState([]);
//   const [search,         setSearch]         = useState("");
//   const [catFilter,      setCatFilter]      = useState("All");
//   const [expandedTopics, setExpandedTopics] = useState({});
//   const [saving,         setSaving]         = useState(false);
//   const [error,          setError]          = useState("");
//   const [step,           setStep]           = useState(1);

//   const [form, setForm] = useState({
//     title:      "",
//     vendorId:   "",
//     vendorName: "",
//     dueDate:    "",
//   });

//   const fetchVendors = useCallback(async () => {
//     try {
//       const res = await fetch(
//         `http://localhost:4019/api/tprm/vendors?organization=${organization}`
//       );
//       if (!res.ok) return [];
//       const data = await res.json();
//       return Array.isArray(data) ? data : [];
//     } catch (err) {
//       console.error("Error fetching vendors:", err);
//       return [];
//     }
//   }, [organization]);

//   const loadData = useCallback(async () => {
//     const [qs, vs] = await Promise.all([
//       tprmService.getQuestions(organization),
//       fetchVendors(),
//     ]);
//     setQuestions(Array.isArray(qs) ? qs : []);
//     setVendors(Array.isArray(vs) ? vs : []);
//   }, [organization, fetchVendors]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const categories = ["All", ...new Set(questions.map(q => q.category).filter(Boolean))];

//   const filtered = questions.filter(q => {
//     const matchSearch = search === "" ||
//       q.text?.toLowerCase().includes(search.toLowerCase()) ||
//       q.topicName?.toLowerCase().includes(search.toLowerCase());
//     const matchCat = catFilter === "All" || q.category === catFilter;
//     return matchSearch && matchCat;
//   });

//   const grouped = filtered.reduce((acc, q) => {
//     const key = `${q.topicNo}||${q.topicName}`;
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(q);
//     return acc;
//   }, {});

//   const toggleQuestion = (id) => {
//     setSelectedQIds(prev =>
//       prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
//     );
//   };

//   const toggleTopic = (key, qs) => {
//     const ids = qs.map(q => q.id);
//     const allSelected = ids.every(id => selectedQIds.includes(id));
//     if (allSelected) {
//       setSelectedQIds(prev => prev.filter(id => !ids.includes(id)));
//     } else {
//       setSelectedQIds(prev => [...new Set([...prev, ...ids])]);
//     }
//   };

//   const toggleTopicExpand = (key) => {
//     setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   const handleVendorChange = (e) => {
//     const val = e.target.value;
//     const selected = vendors.find(v => (v._id || v.id) === val);
//     if (selected) {
//       setForm(f => ({
//         ...f,
//         vendorId:   selected._id || selected.id,
//         vendorName: selected.vendorName || selected.name || "",
//       }));
//     } else {
//       setForm(f => ({ ...f, vendorId: "", vendorName: "" }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!form.title.trim())        return setError("Title is required");
//     if (!form.vendorId)            return setError("Please select a vendor");
//     if (!form.dueDate)             return setError("Due date is required");
//     if (selectedQIds.length === 0) return setError("Select at least one question");

//     setSaving(true);
//     setError("");
//     try {
//       const payload = {
//         title:         form.title,
//         vendorId:      form.vendorId,
//         vendorName:    form.vendorName,
//         vendorEmail:   "",
//         dueDate:       form.dueDate,
//         organization,
//         questionIds:   selectedQIds,
//         createdBy:     user?._id || user?.id,
//         createdByName: user?.name,
//       };
//       await tprmService.createQuestionnaire(payload);
//       onCreated?.();
//     } catch (e) {
//       setError(e.message || "Failed to create questionnaire");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const today = new Date().toISOString().split("T")[0];

//   return (
//     <div className="space-y-5">

//       {/* Header + Step indicator */}
//       <div className="bg-white/80 border border-slate-100 rounded-2xl p-5 shadow-sm">
//         <div className="flex items-center gap-3 mb-1">
//           <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
//             <Plus size={18} className="text-white" />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-slate-800">New Vendor Assessment</h2>
//             <p className="text-sm text-slate-500">Fill in details and select questions</p>
//           </div>
//         </div>
//         <div className="flex gap-2 mt-4">
//           {["Assessment Details", "Select Questions"].map((label, i) => (
//             <button
//               key={i}
//               onClick={() => setStep(i + 1)}
//               className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all
//                 ${step === i + 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
//             >
//               <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold
//                 ${step === i + 1 ? "bg-white text-blue-600" : "bg-slate-300 text-white"}`}>
//                 {i + 1}
//               </span>
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* STEP 1 */}
//       {step === 1 && (
//         <motion.div
//           className="bg-white/80 border border-slate-100 rounded-2xl p-6 shadow-sm"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <h3 className="text-base font-semibold text-slate-800 mb-5">Assessment Details</h3>
//           <div className="space-y-4 max-w-lg">
//             <div>
//               <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
//                 <FileText size={12} /> Assessment Title *
//               </label>
//               <input
//                 type="text"
//                 value={form.title}
//                 onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
//                 placeholder="e.g. Q1 2026 Vendor Security Assessment"
//               />
//             </div>

//             <div>
//               <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
//                 <User size={12} /> Assign to Vendor *
//               </label>
//               <select
//                 value={form.vendorId}
//                 onChange={handleVendorChange}
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
//               >
//                 <option value="">Select vendor...</option>
//                 {vendors.map(v => (
//                   <option key={v._id || v.id} value={v._id || v.id}>
//                     {v.vendorName || v.name}
//                   </option>
//                 ))}
//               </select>
//               {vendors.length === 0 && (
//                 <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 rounded-lg px-3 py-1.5">
//                   No vendors found. Please create a vendor first.
//                 </p>
//               )}
//               {form.vendorName && (
//                 <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
//                   <Check size={11} /> Selected: {form.vendorName}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
//                 <Calendar size={12} /> Due Date *
//               </label>
//               <input
//                 type="date"
//                 min={today}
//                 value={form.dueDate}
//                 onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
//               />
//             </div>
//           </div>

//           {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

//           <button
//             onClick={() => {
//               if (!form.title.trim()) return setError("Title is required");
//               if (!form.vendorId)     return setError("Please select a vendor");
//               if (!form.dueDate)      return setError("Due date is required");
//               setError("");
//               setStep(2);
//             }}
//             className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md hover:-translate-y-0.5 transition-all"
//           >
//             Next: Select Questions →
//           </button>
//         </motion.div>
//       )}

//       {/* STEP 2 */}
//       {step === 2 && (
//         <motion.div
//           className="space-y-4"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
//             <div className="relative flex-1 min-w-48">
//               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search questions..."
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
//               />
//             </div>
//             <div className="flex gap-1 flex-wrap">
//               {categories.map(cat => (
//                 <button
//                   key={cat}
//                   onClick={() => setCatFilter(cat)}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
//                     ${catFilter === cat ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//             <div className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg">
//               {selectedQIds.length} selected
//             </div>
//           </div>

//           <div className="space-y-3">
//             {Object.keys(grouped).length === 0 ? (
//               <div className="bg-white/70 border border-slate-100 rounded-2xl p-10 text-center">
//                 <p className="text-slate-500 font-medium">No questions found</p>
//                 <p className="text-slate-400 text-sm mt-1">Add questions in the Question Bank first</p>
//               </div>
//             ) : (
//               Object.entries(grouped)
//                 .sort(([a], [b]) => parseInt(a) - parseInt(b))
//                 .map(([key, qs]) => {
//                   const [topicNo, topicName] = key.split("||");
//                   const ids     = qs.map(q => q.id);
//                   const allSel  = ids.every(id => selectedQIds.includes(id));
//                   const someSel = ids.some(id => selectedQIds.includes(id));
//                   const isExpanded = expandedTopics[key] !== false;

//                   return (
//                     <div key={key} className="bg-white/80 border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
//                       <div
//                         className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
//                         onClick={() => toggleTopicExpand(key)}
//                       >
//                         <button
//                           onClick={e => { e.stopPropagation(); toggleTopic(key, qs); }}
//                           className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all
//                             ${allSel ? "bg-blue-600 border-blue-600" : someSel ? "bg-blue-200 border-blue-400" : "bg-white border-slate-300"}`}
//                         >
//                           {allSel && <Check size={11} className="text-white" />}
//                           {someSel && !allSel && <div className="w-2 h-2 bg-blue-500 rounded-sm" />}
//                         </button>
//                         <div className="flex-1">
//                           <span className="text-xs text-slate-500 font-medium">Topic {topicNo}</span>
//                           <h4 className="text-sm font-semibold text-slate-800">{topicName}</h4>
//                         </div>
//                         <span className="text-xs text-slate-400">{qs.length} questions</span>
//                         {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
//                       </div>

//                       {isExpanded && (
//                         <div className="divide-y divide-slate-50">
//                           {qs.map((q, qi) => {
//                             const isSel = selectedQIds.includes(q.id);
//                             return (
//                               <div
//                                 key={q.id}
//                                 className={`flex items-start gap-3 px-5 py-3 cursor-pointer transition-colors
//                                   ${isSel ? "bg-blue-50/50" : "hover:bg-slate-50/50"}`}
//                                 onClick={() => toggleQuestion(q.id)}
//                               >
//                                 <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
//                                   ${isSel ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"}`}>
//                                   {isSel && <Check size={11} className="text-white" />}
//                                 </div>
//                                 <span className="text-xs text-slate-400 mt-0.5 w-4 flex-shrink-0">{qi + 1}.</span>
//                                 <p className="text-sm text-slate-700 flex-1 leading-relaxed">{q.text}</p>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })
//             )}
//           </div>

//           {/* Summary + Submit */}
//           <div className="bg-white/80 border border-slate-100 rounded-2xl p-5 shadow-sm">
//             <h3 className="text-sm font-semibold text-slate-800 mb-3">Assessment Summary</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
//               {[
//                 { label: "Title",     value: form.title || "—" },
//                 { label: "Vendor",    value: form.vendorName || "—" },
//                 { label: "Due Date",  value: form.dueDate || "—" },
//                 { label: "Questions", value: `${selectedQIds.length} selected` },
//               ].map(({ label, value }) => (
//                 <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5">
//                   <p className="text-xs text-slate-500 font-medium">{label}</p>
//                   <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</p>
//                 </div>
//               ))}
//             </div>

//             {error && (
//               <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
//             )}

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setStep(1)}
//                 className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
//               >
//                 ← Back
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={saving || selectedQIds.length === 0}
//                 className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
//               >
//                 {saving
//                   ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   : <Shield size={15} />
//                 }
//                 {saving ? "Creating..." : "Create as Draft"}
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default CreateQuestionnaire;