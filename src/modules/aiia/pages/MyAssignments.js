// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ClipboardList,
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   ChevronRight,
//   RefreshCw,
//   PartyPopper,
// } from "lucide-react";
// import { stage1Api } from "../services/aiiaApi";
// import AssignmentDetailPage from "../components/AssignementDetailPage";
// import { captureActivity } from "../../../services/activities";
// import "./MyAssignments.css";

// function MyAssignments({ onSelectAssignment }) {
//   const router = useRouter();
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedAssignment, setSelectedAssignment] = useState(null);
//   const [activeTab, setActiveTab] = useState("pending");

//   const user = JSON.parse(sessionStorage.getItem("user") || "{}");
//   const userId = user._id || user.id;
//   const userRoles = Array.isArray(user?.role)
//     ? user.role
//     : user?.role
//       ? [user.role]
//       : [];
//   const isRootOrAio = userRoles.includes("root") || userRoles.includes("aio");

//   useEffect(() => {
//     fetchAssignments();
//   }, []);

//   const fetchAssignments = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       // root/AIO see everything; risk owners see only their assigned assessments
//       const response = isRootOrAio
//         ? await stage1Api.getAll()
//         : await stage1Api.getByAssignedTo(userId);
//       setAssignments(response.data.data || []);
//     } catch (err) {
//       console.error("Error fetching assignments:", err);
//       setError("Failed to load assignments. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Card click ─────────────────────────────────────────────────────────────
//   // When rendered inside the dashboard modal → delegate up via onSelectAssignment
//   // which will close the modal and push the route with assignment in state.
//   // When rendered as a standalone page (no prop) → internal detail rendering.
//   const handleCardClick = (assignment) => {
//     captureActivity({
//       action: "AIIA_ASSESSMENT_VIEWED",
//       item: `Viewed AI Assessment: ${assignment.aiSystemName}`,
//       assignmentId: assignment._id || assignment.id,
//       status: assignment.status,
//     });
//     if (onSelectAssignment) {
//       onSelectAssignment(assignment);
//     } else {
//       // standalone: push route with state so AssignmentDetailRoute can read it
//       router.push({
//         pathname: `/aiia/my-assignments/${assignment._id || assignment.id}`,
//         state: { assignment },
//       });
//     }
//   };
//   //The satoshi{Nakamoto}
//   // ── Standalone internal detail fallback (kept for backwards compat) ────────
//   if (selectedAssignment) {
//     return (
//       <AssignmentDetailPage
//         assignment={selectedAssignment}
//         onBack={() => setSelectedAssignment(null)}
//         onSaved={() => {
//           setSelectedAssignment(null);
//           fetchAssignments();
//         }}
//       />
//     );
//   }

//   const pending = assignments.filter((a) => a.status === "DRAFT");
//   const completed = assignments.filter(
//     (a) =>
//       a.status === "SUBMITTED" ||
//       a.status === "APPROVED" ||
//       a.status === "REJECTED",
//   );
//   const displayed = activeTab === "pending" ? pending : completed;

//   const getStatusMeta = (status) => {
//     switch (status) {
//       case "DRAFT":
//         return {
//           label: "Action Required",
//           color: "#f59e0b",
//           bg: "#fef3c7",
//           icon: <Clock size={13} />,
//         };
//       case "SUBMITTED":
//         return {
//           label: "Completed",
//           color: "#10b981",
//           bg: "#d1fae5",
//           icon: <CheckCircle size={13} />,
//         };
//       case "APPROVED":
//         return {
//           label: "Approved",
//           color: "#6366f1",
//           bg: "#ede9fe",
//           icon: <CheckCircle size={13} />,
//         };
//       case "REJECTED":
//         return {
//           label: "Rejected",
//           color: "#ef4444",
//           bg: "#fee2e2",
//           icon: <AlertTriangle size={13} />,
//         };
//       default:
//         return { label: status, color: "#6b7280", bg: "#f3f4f6", icon: null };
//     }
//   };

//   return (
//     <div className="assignments-page">
//       <div className="assignments-header">
//         <div className="header-left">
//           <div className="header-icon">
//             <ClipboardList size={22} />
//           </div>
//           <div>
//             <h1>My Assignments</h1>
//             <p>AI assessments assigned to you for review and completion</p>
//           </div>
//         </div>
//         <button
//           className="refresh-btn"
//           onClick={fetchAssignments}
//           disabled={loading}
//         >
//           <RefreshCw size={16} className={loading ? "spinning" : ""} />
//           Refresh
//         </button>
//       </div>

//       {/* Summary Pills */}
//       <div className="summary-pills">
//         <div className="pill pill-warning">
//           <Clock size={16} />
//           <span>{pending.length} Pending</span>
//         </div>
//         <div className="pill pill-success">
//           <CheckCircle size={16} />
//           <span>{completed.length} Completed</span>
//         </div>
//         <div className="pill pill-neutral">
//           <ClipboardList size={16} />
//           <span>{assignments.length} Total</span>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="assignments-tabs">
//         <button
//           className={`tab ${activeTab === "pending" ? "active" : ""}`}
//           onClick={() => {
//             setActiveTab("pending");
//             captureActivity({
//               action: "AIIA_TAB_NAVIGATION",
//               item: "Navigated to Pending Action AI Assessments",
//               tab: "pending",
//             });
//           }}
//         >
//           Pending Action
//           {pending.length > 0 && (
//             <span className="tab-badge">{pending.length}</span>
//           )}
//         </button>
//         <button
//           className={`tab ${activeTab === "completed" ? "active" : ""}`}
//           onClick={() => {
//             setActiveTab("completed");
//             captureActivity({
//               action: "AIIA_TAB_NAVIGATION",
//               item: "Navigated to Completed AI Assessments",
//               tab: "completed",
//             });
//           }}
//         >
//           Completed
//           {completed.length > 0 && (
//             <span className="tab-badge tab-badge-neutral">
//               {completed.length}
//             </span>
//           )}
//         </button>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="error-banner">
//           <AlertTriangle size={16} />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Content */}
//       {loading ? (
//         <div className="loading-state">
//           <div className="loading-spinner-ring" />
//           <p>Loading your assignments...</p>
//         </div>
//       ) : displayed.length === 0 ? (
//         <div className="empty-assignments">
//           <ClipboardList size={48} />
//           <h3>
//             {activeTab === "pending"
//               ? "No pending assignments"
//               : "No completed assignments"}
//           </h3>
//           <p>
//             {activeTab === "pending"
//               ? "You have no assessments requiring action right now."
//               : "Completed assessments will appear here once you finish all checklist items."}
//           </p>
//         </div>
//       ) : (
//         <div className="assignments-list">
//           {displayed.map((assignment) => {
//             const meta = getStatusMeta(assignment.status);
//             const isDone = assignment.status !== "DRAFT";
//             return (
//               <div
//                 key={assignment.id || assignment._id}
//                 className="assignment-card"
//                 onClick={() => handleCardClick(assignment)}
//                 style={isDone ? { borderLeft: "3px solid #10b981" } : {}}
//               >
//                 <div className="assignment-card-left">
//                   <div
//                     className="assignment-icon"
//                     style={
//                       isDone ? { background: "#d1fae5", color: "#10b981" } : {}
//                     }
//                   >
//                     {isDone ? (
//                       <CheckCircle size={20} />
//                     ) : (
//                       <ClipboardList size={20} />
//                     )}
//                   </div>
//                   <div className="assignment-info">
//                     <h3
//                       style={{ display: "flex", alignItems: "center", gap: 8 }}
//                     >
//                       {assignment.aiSystemName}
//                       {assignment.status === "SUBMITTED" && (
//                         <PartyPopper
//                           size={15}
//                           style={{ color: "#10b981", flexShrink: 0 }}
//                         />
//                       )}
//                     </h3>
//                     <div className="assignment-meta">
//                       {/* <span className="meta-item">🏢 {assignment.department}</span> */}
//                       <span className="meta-divider">·</span>
//                       {/* <span className="meta-item">👤 {assignment.aiSystemOwner}</span> */}
//                       <span className="meta-divider">·</span>
//                       <span className="meta-item">
//                         {" "}
//                         {assignment.dateOfAssessment
//                           ? new Date(
//                               assignment.dateOfAssessment,
//                             ).toLocaleDateString()
//                           : "No date set"}
//                       </span>
//                     </div>
//                     <p className="assignment-objective">
//                       {assignment.businessObjective}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="assignment-card-right">
//                   <span
//                     className="status-chip"
//                     style={{ color: meta.color, background: meta.bg }}
//                   >
//                     {meta.icon}
//                     {meta.label}
//                   </span>
//                   <button
//                     className="start-btn"
//                     style={
//                       isDone ? { background: "#f1f5f9", color: "#64748b" } : {}
//                     }
//                   >
//                     {isDone ? "View Details" : "Start Assessment"}
//                     <ChevronRight size={16} />
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// export default MyAssignments;


//Testing
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  PartyPopper,
} from "lucide-react";
import { stage1Api } from "../services/aiiaApi";
import AssignmentDetailPage from "../components/AssignementDetailPage";

// ── Logging ───────────────────────────────────────────────────────────────────
// CHANGE: previously imported only `captureActivity` and called it with
// custom, non-canonical action strings ("AIIA_ASSESSMENT_VIEWED",
// "AIIA_TAB_NAVIGATION") and no `module`/`url` fields at all. Since
// buildPayload() defaults an omitted module to MODULES.SYSTEM, and SYSTEM is
// excluded from HUMAN_MODULES, these calls either never reached the backend
// (if routed through the gated activities.js) or reached it with blank
// module/url (if routed through a different, ungated copy) — which matches
// the blank-module rows seen in the activity log viewer.
//
// NOTE: the import path here was "../../../services/activities", which is
// shallower than the "../../admin/shell/services/activities" path used by
// every other module (Risk, Task). CONFIRM whether this resolves to the same
// shared file or a separate/stale copy — if it's a duplicate, delete it and
// point this import at the real shared service instead.
import { captureActivity, ACTIONS, MODULES } from "../../admin/shell/services/activities";
import "./MyAssignments.css";

function MyAssignments({ onSelectAssignment }) {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = user._id || user.id;
  const userRoles = Array.isArray(user?.role)
    ? user.role
    : user?.role
      ? [user.role]
      : [];
  const isRootOrAio = userRoles.includes("root") || userRoles.includes("aio");

  useEffect(() => {
    fetchAssignments();
    // ── LOG: VISITED — page load ──────────────────────────────────────────
    // Previously missing entirely; this page had no VISITED log at all.
    captureActivity({
      action: ACTIONS.VISITED,
      module: MODULES.AIIA,
      url: "/aiia/my-assignments",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      // root/AIO see everything; risk owners see only their assigned assessments
      const response = isRootOrAio
        ? await stage1Api.getAll()
        : await stage1Api.getByAssignedTo(userId);
      setAssignments(response.data.data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Card click ─────────────────────────────────────────────────────────────
  // When rendered inside the dashboard modal → delegate up via onSelectAssignment
  // which will close the modal and push the route.
  // When rendered as a standalone page (no prop) → navigate to the detail route,
  // which fetches the assignment by id itself (Next.js router.push doesn't carry
  // react-router-style state, so we can't pass the object through navigation).
  const handleCardClick = (assignment) => {
    // ── LOG: CLICK — CHANGE: was action "AIIA_ASSESSMENT_VIEWED" with no
    // module/url and stray top-level fields (assignmentId, status) that
    // buildPayload() silently dropped. Now uses the canonical CLICK action,
    // proper module/url, and folds context into `item` as an array-of-object
    // so it survives buildPayload and renders correctly in formatItem().
    captureActivity({
      action: ACTIONS.CLICK,
      module: MODULES.AIIA,
      url: "/aiia/my-assignments",
      item: [{
        aiSystemName: assignment.aiSystemName,
        assignmentId: assignment._id || assignment.id,
        status: assignment.status,
        detail: "Opened AI Assessment",
      }],
    });
    if (onSelectAssignment) {
      onSelectAssignment(assignment);
    } else {
      router.push(`/aiia/my-assignments/${assignment._id || assignment.id}`);
    }
  };
  //The satoshi{Nakamoto}
  // ── Standalone internal detail fallback (kept for backwards compat) ────────
  if (selectedAssignment) {
    return (
      <AssignmentDetailPage
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
        onSaved={() => {
          setSelectedAssignment(null);
          fetchAssignments();
        }}
      />
    );
  }

  // Anything not explicitly a "completed" state counts as pending — this way
  // legacy/unexpected status values (e.g. records created before the status
  // was standardized to DRAFT) still show up instead of silently vanishing.
  const COMPLETED_STATUSES = ["SUBMITTED", "APPROVED", "REJECTED"];
  const pending = assignments.filter(
    (a) => !COMPLETED_STATUSES.includes(a.status),
  );
  const completed = assignments.filter((a) =>
    COMPLETED_STATUSES.includes(a.status),
  );
  const displayed = activeTab === "pending" ? pending : completed;

  const getStatusMeta = (status) => {
    switch (status) {
      case "DRAFT":
        return {
          label: "Action Required",
          color: "#f59e0b",
          bg: "#fef3c7",
          icon: <Clock size={13} />,
        };
      case "SUBMITTED":
        return {
          label: "Completed",
          color: "#10b981",
          bg: "#d1fae5",
          icon: <CheckCircle size={13} />,
        };
      case "APPROVED":
        return {
          label: "Approved",
          color: "#6366f1",
          bg: "#ede9fe",
          icon: <CheckCircle size={13} />,
        };
      case "REJECTED":
        return {
          label: "Rejected",
          color: "#ef4444",
          bg: "#fee2e2",
          icon: <AlertTriangle size={13} />,
        };
      default:
        // Any non-completed status (e.g. legacy "ASSIGNED" records) reads
        // as "still needs action", matching the pending bucket above.
        return {
          label: "Action Required",
          color: "#f59e0b",
          bg: "#fef3c7",
          icon: <Clock size={13} />,
        };
    }
  };

  return (
    <div className="assignments-page">
      <div className="assignments-header">
        <div className="header-left">
          <div className="header-icon">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1>My Assignments</h1>
            <p>AI assessments assigned to you for review and completion</p>
          </div>
        </div>
        <button
          className="refresh-btn"
          onClick={() => {
            // ── LOG: CLICK — refresh ────────────────────────────────────────
            captureActivity({
              action: ACTIONS.CLICK,
              module: MODULES.AIIA,
              url: "/aiia/my-assignments",
              item: [{ detail: "Refreshed My Assignments" }],
            });
            fetchAssignments();
          }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Pills */}
      <div className="summary-pills">
        <div className="pill pill-warning">
          <Clock size={16} />
          <span>{pending.length} Pending</span>
        </div>
        <div className="pill pill-success">
          <CheckCircle size={16} />
          <span>{completed.length} Completed</span>
        </div>
        <div className="pill pill-neutral">
          <ClipboardList size={16} />
          <span>{assignments.length} Total</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="assignments-tabs">
        <button
          className={`tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("pending");
            // ── LOG: CLICK — CHANGE: was custom action "AIIA_TAB_NAVIGATION"
            // with no module/url and a stray `tab` field. Now canonical CLICK
            // with module/url set and tab context folded into `item`.
            captureActivity({
              action: ACTIONS.CLICK,
              module: MODULES.AIIA,
              url: "/aiia/my-assignments",
              item: [{ detail: "Navigated to Pending Action AI Assessments", tab: "pending" }],
            });
          }}
        >
          Pending Action
          {pending.length > 0 && (
            <span className="tab-badge">{pending.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("completed");
            captureActivity({
              action: ACTIONS.CLICK,
              module: MODULES.AIIA,
              url: "/aiia/my-assignments",
              item: [{ detail: "Navigated to Completed AI Assessments", tab: "completed" }],
            });
          }}
        >
          Completed
          {completed.length > 0 && (
            <span className="tab-badge tab-badge-neutral">
              {completed.length}
            </span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner-ring" />
          <p>Loading your assignments...</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="empty-assignments">
          <ClipboardList size={48} />
          <h3>
            {activeTab === "pending"
              ? "No pending assignments"
              : "No completed assignments"}
          </h3>
          <p>
            {activeTab === "pending"
              ? "You have no assessments requiring action right now."
              : "Completed assessments will appear here once you finish all checklist items."}
          </p>
        </div>
      ) : (
        <div className="assignments-list">
          {displayed.map((assignment) => {
            const meta = getStatusMeta(assignment.status);
            const isDone = COMPLETED_STATUSES.includes(assignment.status);
            return (
              <div
                key={assignment.id || assignment._id}
                className="assignment-card"
                onClick={() => handleCardClick(assignment)}
                style={isDone ? { borderLeft: "3px solid #10b981" } : {}}
              >
                <div className="assignment-card-left">
                  <div
                    className="assignment-icon"
                    style={
                      isDone ? { background: "#d1fae5", color: "#10b981" } : {}
                    }
                  >
                    {isDone ? (
                      <CheckCircle size={20} />
                    ) : (
                      <ClipboardList size={20} />
                    )}
                  </div>
                  <div className="assignment-info">
                    <h3
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {assignment.aiSystemName}
                      {assignment.status === "SUBMITTED" && (
                        <PartyPopper
                          size={15}
                          style={{ color: "#10b981", flexShrink: 0 }}
                        />
                      )}
                    </h3>
                    <div className="assignment-meta">
                      {/* <span className="meta-item">🏢 {assignment.department}</span> */}
                      <span className="meta-divider">·</span>
                      {/* <span className="meta-item">👤 {assignment.aiSystemOwner}</span> */}
                      <span className="meta-divider">·</span>
                      <span className="meta-item">
                        {" "}
                        {assignment.dateOfAssessment
                          ? new Date(
                              assignment.dateOfAssessment,
                            ).toLocaleDateString()
                          : "No date set"}
                      </span>
                    </div>
                    <p className="assignment-objective">
                      {assignment.businessObjective}
                    </p>
                  </div>
                </div>
                <div className="assignment-card-right">
                  <span
                    className="status-chip"
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                  <button
                    className="start-btn"
                    style={
                      isDone ? { background: "#f1f5f9", color: "#64748b" } : {}
                    }
                  >
                    {isDone ? "View Details" : "Start Assessment"}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyAssignments;