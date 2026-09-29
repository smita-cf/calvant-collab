// //C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\tprm\components\TPRMQuestionModal.js


// import React, { useState, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X, BookOpen, Search, ChevronDown, ChevronUp, Shield } from "lucide-react";
// import tprmService from "../services/tprmService";

// const TPRMQuestionsModal = ({ user, organization, onClose }) => {
//   const [questions,      setQuestions]      = useState([]);
//   const [loading,        setLoading]        = useState(true);
//   const [search,         setSearch]         = useState("");
//   const [expandedTopics, setExpandedTopics] = useState({});

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await tprmService.getQuestions(organization);
//       setQuestions(Array.isArray(data) ? data : []);
//     } finally {
//       setLoading(false);
//     }
//   }, [organization]);

//   useEffect(() => { load(); }, [load]);

//   const filtered = questions.filter(q =>
//     search === "" ||
//     q.text?.toLowerCase().includes(search.toLowerCase()) ||
//     q.topicName?.toLowerCase().includes(search.toLowerCase())
//   );

//   const grouped = filtered.reduce((acc, q) => {
//     const key = `${q.topicNo}||${q.topicName}`;
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(q);
//     return acc;
//   }, {});

//   const toggleTopic = (key) => {
//     setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <motion.div
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
//         initial={{ scale: 0.95, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.95, opacity: 0 }}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-slate-100">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
//               <BookOpen size={18} className="text-white" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-slate-800">TPRM Question Bank</h2>
//               <p className="text-xs text-slate-500">{questions.length} questions across {Object.keys(grouped).length} sections</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
//             <X size={18} className="text-slate-500" />
//           </button>
//         </div>

//         {/* Search */}
//         <div className="px-6 py-3 border-b border-slate-50">
//           <div className="relative">
//             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//             <input
//               type="text"
//               placeholder="Search questions or sections..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-slate-50"
//             />
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-3">
//           {loading ? (
//             <div className="flex items-center justify-center h-48">
//               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           ) : Object.keys(grouped).length === 0 ? (
//             <div className="text-center py-12">
//               <Shield size={36} className="text-slate-300 mx-auto mb-3" />
//               <p className="text-slate-500 font-medium">No questions found</p>
//               <p className="text-slate-400 text-sm mt-1">Seed the question bank first using the API</p>
//               <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 block w-fit mx-auto">
//                 POST /api/tprm/questions/seed
//               </code>
//             </div>
//           ) : (
//             Object.entries(grouped)
//               .sort(([a], [b]) => parseInt(a) - parseInt(b))
//               .map(([key, qs], gi) => {
//                 const [topicNo, topicName] = key.split("||");
//                 const isExpanded = expandedTopics[key] !== false;
//                 return (
//                   <motion.div
//                     key={key}
//                     className="border border-slate-100 rounded-xl overflow-hidden shadow-sm"
//                     initial={{ opacity: 0, y: 5 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: gi * 0.03 }}
//                   >
//                     <div
//                       className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
//                       onClick={() => toggleTopic(key)}
//                     >
//                       <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                         {topicNo}
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="text-sm font-semibold text-slate-800">Section {topicNo}: {topicName}</h4>
//                       </div>
//                       <span className="text-xs text-slate-400 mr-2">{qs.length} questions</span>
//                       {isExpanded
//                         ? <ChevronUp size={14} className="text-slate-400" />
//                         : <ChevronDown size={14} className="text-slate-400" />
//                       }
//                     </div>
//                     {isExpanded && (
//                       <div className="divide-y divide-slate-50">
//                         {qs.map((q, qi) => (
//                           <div key={q.id} className="flex gap-3 px-4 py-3 hover:bg-blue-50/30 transition-colors">
//                             <span className="text-xs font-bold text-slate-400 mt-0.5 w-5 flex-shrink-0">{qi + 1}.</span>
//                             <p className="text-sm text-slate-700 leading-relaxed">{q.text}</p>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </motion.div>
//                 );
//               })
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default TPRMQuestionsModal;









// C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\tprm\components\TPRMQuestionModal.js

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Search, ChevronDown, ChevronUp, Shield } from "lucide-react";
import tprmService from "../services/tprmService";

const NAVBAR_HEIGHT = 72; // px — matches PersistentSidebar fixed top navbar
const MODAL_GAP    = 32; // px gap between navbar bottom and modal top

const TPRMQuestionsModal = ({ user, organization, onClose }) => {
  const [questions,      setQuestions]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [expandedTopics, setExpandedTopics] = useState({});

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

  const filtered = questions.filter(q =>
    search === "" ||
    q.text?.toLowerCase().includes(search.toLowerCase()) ||
    q.topicName?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, q) => {
    const key = `${q.topicNo}||${q.topicName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  const toggleTopic = (key) => {
    setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    /* ── Overlay ── */
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
      style={{ paddingTop: NAVBAR_HEIGHT + MODAL_GAP, paddingBottom: MODAL_GAP }}
    >
      {/* ── Modal shell — fixed width matching ConductTPRMModal (max-w-4xl) ── */}
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto flex flex-col"
        style={{
          /* Max height = viewport minus top gap minus bottom gap */
          maxHeight: `calc(100vh - ${NAVBAR_HEIGHT + MODAL_GAP * 2}px)`,
        }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">TPRM Question Bank</h2>
              <p className="text-xs text-slate-500">
                {questions.length} questions across {Object.keys(grouped).length} sections
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-50 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions or sections..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-slate-50"
            />
          </div>
        </div>

        {/* Content — scrolls inside the modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12">
              <Shield size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No questions found</p>
              <p className="text-slate-400 text-sm mt-1">Seed the question bank first using the API</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 block w-fit mx-auto">
                POST /api/tprm/questions/seed
              </code>
            </div>
          ) : (
            Object.entries(grouped)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([key, qs], gi) => {
                const [topicNo, topicName] = key.split("||");
                const isExpanded = expandedTopics[key] !== false;
                return (
                  <motion.div
                    key={key}
                    className="border border-slate-100 rounded-xl overflow-hidden shadow-sm"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.03 }}
                  >
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleTopic(key)}
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {topicNo}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-800">Section {topicNo}: {topicName}</h4>
                      </div>
                      <span className="text-xs text-slate-400 mr-2">{qs.length} questions</span>
                      {isExpanded
                        ? <ChevronUp size={14} className="text-slate-400" />
                        : <ChevronDown size={14} className="text-slate-400" />
                      }
                    </div>
                    {isExpanded && (
                      <div className="divide-y divide-slate-50">
                        {qs.map((q, qi) => (
                          <div key={q.id} className="flex gap-3 px-4 py-3 hover:bg-blue-50/30 transition-colors">
                            <span className="text-xs font-bold text-slate-400 mt-0.5 w-5 flex-shrink-0">{qi + 1}.</span>
                            <p className="text-sm text-slate-700 leading-relaxed">{q.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TPRMQuestionsModal;