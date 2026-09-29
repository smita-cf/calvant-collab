// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import adminAxios from "../../api/adminAxios";
// import {
//   CheckCircle2,
//   Circle,
//   Lock,
//   Building2,
//   Shield,
//   GraduationCap,
//   ChevronRight,
//   Plus,
//   Trash2,
//   User,
//   Mail,
//   Phone,
//   Globe,
//   MapPin,
//   Users,
//   Briefcase,
//   Calendar,
//   BookOpen,
//   Video,
//   FileText,
//   Award,
//   Loader2,
//   PartyPopper,
//   X,
//   AlertCircle,
// } from "lucide-react";
// import { jwtDecode } from "jwt-decode";
// import useModuleEntitlements from "../../hooks/useModuleEntitlements";
// import CreateDept from "../Departments/CreateDept";

// const API = "https://api.calvant.com/user-service";

// // ─── Helpers ─────────────────────────────────────────────────────────────────
// const ax = adminAxios; // already has Bearer + x-org + x-role interceptors

// // ─── Sub-component: Step Header ───────────────────────────────────────────────
// function StepCard({
//   number,
//   title,
//   icon: Icon,
//   status,
//   locked,
//   onClick,
//   children,
// }) {
//   const isOpen = status === "open";
//   const isDone = status === "done";

//   return (
//     <div
//       style={{
//         border: isDone
//           ? "1.5px solid #22c55e"
//           : isOpen
//             ? "1.5px solid #6366f1"
//             : "1.5px solid #e2e8f0",
//         borderRadius: 16,
//         marginBottom: 20,
//         background: "#fff",
//         overflow: "hidden",
//         boxShadow: isOpen
//           ? "0 4px 24px rgba(99,102,241,0.08)"
//           : "0 1px 4px rgba(0,0,0,0.04)",
//         transition: "all 0.3s ease",
//       }}
//     >
//       {/* Header row */}
//       <div
//         onClick={!locked ? onClick : undefined}
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 16,
//           padding: "20px 24px",
//           cursor: locked ? "not-allowed" : "pointer",
//           userSelect: "none",
//           background: isDone
//             ? "linear-gradient(90deg,#f0fdf4,#fff)"
//             : isOpen
//               ? "linear-gradient(90deg,#eef2ff,#fff)"
//               : "#fafafa",
//         }}
//       >
//         {/* Step number bubble */}
//         <div
//           style={{
//             width: 42,
//             height: 42,
//             borderRadius: "50%",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             flexShrink: 0,
//             background: isDone ? "#22c55e" : isOpen ? "#6366f1" : "#e2e8f0",
//             color: "#fff",
//             fontWeight: 700,
//             fontSize: 16,
//           }}
//         >
//           {isDone ? (
//             <CheckCircle2 size={22} />
//           ) : locked ? (
//             <Lock size={18} />
//           ) : (
//             number
//           )}
//         </div>

//         <div style={{ flex: 1 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <Icon
//               size={18}
//               color={isDone ? "#22c55e" : isOpen ? "#6366f1" : "#94a3b8"}
//             />
//             <span
//               style={{
//                 fontWeight: 700,
//                 fontSize: 17,
//                 color: locked
//                   ? "#94a3b8"
//                   : isDone
//                     ? "#15803d"
//                     : isOpen
//                       ? "#4f46e5"
//                       : "#1e293b",
//               }}
//             >
//               {title}
//             </span>
//           </div>
//           <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
//             {locked
//               ? "Complete previous step to unlock"
//               : isDone
//                 ? "Completed ✓"
//                 : isOpen
//                   ? "In progress — fill in the details below"
//                   : "Click to begin"}
//           </div>
//         </div>

//         {!locked && (
//           <ChevronRight
//             size={20}
//             color="#cbd5e1"
//             style={{
//               transform: isOpen ? "rotate(90deg)" : "none",
//               transition: "transform 0.2s",
//             }}
//           />
//         )}
//       </div>

//       {/* Body — only rendered when open */}
//       {isOpen && <div style={{ padding: "0 24px 28px" }}>{children}</div>}
//     </div>
//   );
// }

// // ─── Sub-component: Field ─────────────────────────────────────────────────────
// function Field({ label, required, children, hint }) {
//   return (
//     <div style={{ marginBottom: 18 }}>
//       <label
//         style={{
//           display: "block",
//           fontSize: 13,
//           fontWeight: 600,
//           color: "#475569",
//           marginBottom: 6,
//         }}
//       >
//         {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
//       </label>
//       {children}
//       {hint && (
//         <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
//           {hint}
//         </div>
//       )}
//     </div>
//   );
// }

// function Input({
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   readOnly,
//   prefix,
// }) {
//   return (
//     <div style={{ position: "relative" }}>
//       {prefix && (
//         <span
//           style={{
//             position: "absolute",
//             left: 12,
//             top: "50%",
//             transform: "translateY(-50%)",
//             color: "#94a3b8",
//           }}
//         >
//           {prefix}
//         </span>
//       )}
//       <input
//         type={type}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         readOnly={readOnly}
//         style={{
//           width: "100%",
//           padding: prefix ? "10px 12px 10px 36px" : "10px 12px",
//           border: "1.5px solid",
//           borderColor: readOnly ? "#f1f5f9" : "#e2e8f0",
//           borderRadius: 8,
//           fontSize: 14,
//           color: readOnly ? "#94a3b8" : "#1e293b",
//           background: readOnly ? "#f8fafc" : "#fff",
//           boxSizing: "border-box",
//           outline: "none",
//           transition: "border-color 0.15s",
//         }}
//         onFocus={(e) => !readOnly && (e.target.style.borderColor = "#6366f1")}
//         onBlur={(e) => !readOnly && (e.target.style.borderColor = "#e2e8f0")}
//       />
//     </div>
//   );
// }

// function Select({ value, onChange, options }) {
//   return (
//     <select
//       value={value}
//       onChange={onChange}
//       style={{
//         width: "100%",
//         padding: "10px 12px",
//         border: "1.5px solid #e2e8f0",
//         borderRadius: 8,
//         fontSize: 14,
//         color: "#1e293b",
//         background: "#fff",
//         boxSizing: "border-box",
//         outline: "none",
//         cursor: "pointer",
//       }}
//     >
//       <option value="">Select…</option>
//       {options.map((o) => (
//         <option key={o.value} value={o.value}>
//           {o.label}
//         </option>
//       ))}
//     </select>
//   );
// }

// function Btn({
//   children,
//   onClick,
//   variant = "primary",
//   disabled,
//   loading,
//   small,
// }) {
//   const styles = {
//     primary: { background: "#6366f1", color: "#fff", border: "none" },
//     secondary: {
//       background: "#f1f5f9",
//       color: "#475569",
//       border: "1.5px solid #e2e8f0",
//     },
//     danger: {
//       background: "#fef2f2",
//       color: "#ef4444",
//       border: "1.5px solid #fecaca",
//     },
//     success: { background: "#22c55e", color: "#fff", border: "none" },
//   };
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled || loading}
//       style={{
//         ...styles[variant],
//         padding: small ? "7px 14px" : "10px 22px",
//         borderRadius: 8,
//         fontWeight: 600,
//         fontSize: small ? 13 : 14,
//         cursor: disabled || loading ? "not-allowed" : "pointer",
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 6,
//         opacity: disabled || loading ? 0.6 : 1,
//         transition: "opacity 0.15s",
//       }}
//     >
//       {loading && (
//         <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
//       )}
//       {children}
//     </button>
//   );
// }

// function Tag({ label, color = "#6366f1" }) {
//   return (
//     <span
//       style={{
//         display: "inline-block",
//         padding: "3px 10px",
//         background: color + "18",
//         color,
//         borderRadius: 20,
//         fontSize: 12,
//         fontWeight: 600,
//         border: `1px solid ${color}30`,
//       }}
//     >
//       {label}
//     </span>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function OnboardingModule() {
//   const { seatLimit } = useModuleEntitlements();
//   const [progress, setProgress] = useState(null);
//   const [org, setOrg] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeStep, setActiveStep] = useState(1);
//   const [error, setError] = useState(null);
//   const [teamSizeError, setTeamSizeError] = useState(null);

//   // Step 1 state
//   const [biz, setBiz] = useState({
//     address: "",
//     phone: "",
//     website: "",
//     industry: "",
//     totalEmployees: "",
//     officeLocations: "",
//     complianceTeamSize: "",
//     primaryContactName: "",
//     primaryContactEmail: "",
//     primaryContactPhone: "",
//     domain: "",
//   });
//   const [step1Saving, setStep1Saving] = useState(false);

//   // Step 2 state
//   const [departments, setDepartments] = useState([]);
//   const [newDeptName, setNewDeptName] = useState("");
//   const [deptSaving, setDeptSaving] = useState(false);
//   const [addingDept, setAddingDept] = useState(false);
//   const [lastCreatedDept, setLastCreatedDept] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [lastCreatedUser, setLastCreatedUser] = useState(null);
//   // ── State: add modules field ──────────────────────────────────────────────
//   const [newUser, setNewUser] = useState({
//     name: "",
//     email: "",
//     role: "", // single string from <Select>
//     department: "",
//     password: "",
//     modules: [], // ← add this
//   });
//   const [userSaving, setUserSaving] = useState(false);
//   const [step2Saving, setStep2Saving] = useState(false);

//   // Step 3 state
//   const [training, setTraining] = useState({
//     preferredDate: "",
//     mode: "",
//     contactName: "",
//     contactEmail: "",
//     acknowledged: false,
//   });
//   const [step3Saving, setStep3Saving] = useState(false);

//   // ── Load onboarding data on mount ──────────────────────────────────────────
//   const fetchOnboarding = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await ax.get(`${API}/api/onboarding`);
//       const { progress: p, organization: o } = res.data;
//       setProgress(p);
//       setOrg(o);
//       // The root login that created this org — used to auto-fill the
//       // Primary Contact fields below instead of asking for them again.
//       let rootLogin = {};
//       try {
//         const u = JSON.parse(sessionStorage.getItem("user") || "{}");
//         rootLogin = { name: u.name || u.username || "", email: u.email || "" };
//       } catch {
//         rootLogin = {};
//       }
//       // Pre-fill step 1 from org
//       setBiz((prev) => ({
//         ...prev,
//         address: o.address || "",
//         phone: o.phone || "",
//         website: o.website || "",
//         primaryContactName: rootLogin.name || prev.primaryContactName,
//         primaryContactEmail: rootLogin.email || prev.primaryContactEmail,
//         ...(p.businessInfo || {}),
//       }));
//       if (p.trainingInfo) setTraining(p.trainingInfo);
//       // Determine active step
//       if (p.step3Completed) setActiveStep(3);
//       else if (p.step2Completed) setActiveStep(3);
//       else if (p.step1Completed) setActiveStep(2);
//       else setActiveStep(1);
//       // Load departments from this org
//       const deptRes = await ax.get(`${API}/api/departments`);
//       setDepartments(deptRes.data || []);
//     } catch (e) {
//       if (e.response?.status === 422 || e.response?.status === 403) {
//         setError("STALE_TOKEN");
//       } else {
//         setError("Failed to load onboarding data. Please refresh.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchOnboarding();
//   }, [fetchOnboarding]);

//   const fetchDepartments = async () => {
//     try {
//       const deptRes = await ax.get(`${API}/api/departments`);
//       setDepartments(deptRes.data || []);
//     } catch (e) {
//       console.error("Failed to fetch departments", e);
//     }
//   };

//   // ── Step 1 save ────────────────────────────────────────────────────────────
//   const saveStep1 = async () => {
//     const required = ["industry", "primaryContactName", "primaryContactEmail"];
//     for (const f of required) {
//       if (!biz[f]) {
//         setError(
//           `Please fill in: ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`,
//         );
//         return;
//       }
//     }
//     try {
//       setStep1Saving(true);
//       setError(null);
//       await ax.patch(`${API}/api/onboarding/step1`, {
//         businessInfo: {
//           ...biz,
//           legalEntityName: org?.name, // ← inject from org, no form field needed
//           submittedByName: (() => {
//             try {
//               const u = JSON.parse(sessionStorage.getItem("user") || "{}");
//               return (
//                 u.name || u.username || u.email || biz.primaryContactName || ""
//               );
//             } catch {
//               return biz.primaryContactName || "";
//             }
//           })(),
//           submittedByEmail: (() => {
//             try {
//               const u = JSON.parse(sessionStorage.getItem("user") || "{}");
//               return u.email || biz.primaryContactEmail || "";
//             } catch {
//               return biz.primaryContactName || "";
//             }
//           })(),
//         },
//       });
//       const res = await ax.get(`${API}/api/onboarding`);
//       setProgress(res.data.progress);
//       setActiveStep(2);
//     } catch (e) {
//       setError(e.response?.data?.message || "Failed to save Step 1.");
//     } finally {
//       setStep1Saving(false);
//     }
//   };

//   // ── Add department ─────────────────────────────────────────────────────────
//   const addDepartment = async () => {
//     if (!newDeptName.trim()) return;
//     try {
//       setDeptSaving(true);
//       const res = await ax.post(`${API}/api/departments`, {
//         name: newDeptName,
//       });
//       setDepartments((d) => [...d, res.data]);
//       setNewDeptName("");
//     } catch (e) {
//       setError(e.response?.data || "Failed to add department.");
//     } finally {
//       setDeptSaving(false);
//     }
//   };

//   const deleteDepartment = async (id) => {
//     try {
//       await ax.delete(`${API}/api/departments/${id}`);
//       setDepartments((d) => d.filter((x) => x.id !== id));
//     } catch (e) {
//       setError("Failed to delete department.");
//     }
//   };

//   const createUser = async () => {
//     const req = ["name", "email", "role", "password"];
//     for (const f of req) {
//       if (!newUser[f]) {
//         setError(`Please fill: ${f}`);
//         return;
//       }
//     }
//     try {
//       setUserSaving(true);
//       setError(null);

//       const roleArr = newUser.role ? [newUser.role] : [];
//       const deptArr = newUser.department ? [newUser.department] : [];

//       // Mirror UserForm exactly: org comes from session/JWT, NOT from the onboarding
//       // API response object (org?.id may be a different format than the JWT claim)
//       const token =
//         sessionStorage.getItem("token") || localStorage.getItem("token");
//       const decoded = (() => {
//         try {
//           return token ? jwtDecode(token) : null;
//         } catch {
//           return null;
//         }
//       })();
//       const sessionUser = (() => {
//         try {
//           return JSON.parse(
//             sessionStorage.getItem("user") ||
//               localStorage.getItem("myObject") ||
//               "{}",
//           );
//         } catch {
//           return {};
//         }
//       })();

//       // Priority: JWT claim → session user object → onboarding API org id
//       let orgId = decoded?.organization;
//       if (orgId && typeof orgId === "object") {
//         orgId = orgId.id || orgId._id;
//       }
//       if (!orgId) {
//         if (typeof sessionUser?.organization === "string")
//           orgId = sessionUser.organization;
//         else if (sessionUser?.organization?.id)
//           orgId = sessionUser.organization.id;
//         else if (sessionUser?.organization?._id)
//           orgId = sessionUser.organization._id;
//         else orgId = org?.id || org?._id || "";
//       }

//       const res = await ax.post(`${API}/api/users/register`, {
//         name: newUser.name,
//         email: newUser.email.toLowerCase(),
//         password: newUser.password,
//         role: roleArr,
//         department: deptArr,
//         organization: orgId,
//         modules: [],
//         vendors: [],
//         isAuditor:
//           roleArr.includes("auditor") || roleArr.includes("audit_manager"),
//       });

//       setUsers((u) => [...u, res.data]);
//       setLastCreatedUser(newUser.name);
//       setNewUser({
//         name: "",
//         email: "",
//         role: "",
//         department: "",
//         password: "",
//         modules: [],
//       });
//     } catch (e) {
//       console.error("Create User Error:", e.response?.data);
//       setError(
//         e.response?.data?.message ||
//           e.response?.data?.error ||
//           "Failed to create user.",
//       );
//     } finally {
//       setUserSaving(false);
//     }
//   };

//   const removeUser = (email) =>
//     setUsers((u) => u.filter((x) => x.email !== email));

//   // ── Step 2 save ────────────────────────────────────────────────────────────
//   const saveStep2 = async () => {
//     try {
//       setStep2Saving(true);
//       setError(null);
//       await ax.patch(`${API}/api/onboarding/step2`, {
//         departmentIds: departments.map((d) => d.id),
//         userIds: users.map((u) => u.id || u.email),
//       });
//       const res = await ax.get(`${API}/api/onboarding`);
//       setProgress(res.data.progress);
//       setActiveStep(3);
//     } catch (e) {
//       setError(
//         typeof e.response?.data === "string"
//           ? e.response.data
//           : e.response?.data?.message || "Failed to save Step 2.",
//       );
//     } finally {
//       setStep2Saving(false);
//     }
//   };

//   // ── Step 3 save ────────────────────────────────────────────────────────────
//   const saveStep3 = async () => {
//     if (!training.acknowledged) {
//       setError(
//         "Please acknowledge that you have reviewed the training materials.",
//       );
//       return;
//     }
//     try {
//       setStep3Saving(true);
//       setError(null);
//       await ax.patch(`${API}/api/onboarding/step3`, {
//         trainingInfo: {
//           preferredDate: training.preferredDate,
//           acknowledged: true,
//         },
//       });
//       const res = await ax.get(`${API}/api/onboarding`);
//       setProgress(res.data.progress);
//     } catch (e) {
//       setError(
//         typeof e.response?.data === "string"
//           ? e.response.data
//           : e.response?.data?.message || "Failed to save Step 3.",
//       );
//     } finally {
//       setStep3Saving(false);
//     }
//   };

//   // ── Role options (matching your existing backend roles) ───────────────────
//   const ROLE_OPTIONS = [
//     { value: "risk_owner", label: "Risk Owner" },
//     { value: "risk_manager", label: "Risk Manager" },
//     { value: "process_owner", label: "Process Owner" },
//     { value: "auditor", label: "Auditor" },
//     { value: "policy_manager", label: "Policy Manager" },
//     { value: "compliance_officer", label: "Compliance Officer" },
//     ...(org?.tprmEnabled
//       ? [{ value: "tprm_manager", label: "TPRM Manager" }]
//       : []),
//   ];

//   const INDUSTRY_OPTIONS = [
//     { value: "Technology", label: "Technology" },
//     { value: "Banking & Finance", label: "Banking & Finance" },
//     { value: "Healthcare", label: "Healthcare" },
//     { value: "Manufacturing", label: "Manufacturing" },
//     { value: "Retail", label: "Retail" },
//     { value: "Government", label: "Government" },
//     { value: "Education", label: "Education" },
//     { value: "Energy", label: "Energy" },
//     { value: "Telecom", label: "Telecom" },
//     { value: "Other", label: "Other" },
//   ];

//   const TRAINING_RESOURCES = [
//     {
//       icon: BookOpen,
//       title: "ISO 27001 Fundamentals",
//       desc: "Overview of the information security management standard.",
//       tag: "ISO 27001",
//       color: "#6366f1",
//     },
//     {
//       icon: Shield,
//       title: "Risk Assessment Guide",
//       desc: "How to identify, evaluate, and treat information security risks.",
//       tag: "Risk",
//       color: "#8b5cf6",
//     },
//     {
//       icon: FileText,
//       title: "Policy Writing Templates",
//       desc: "Ready-to-use templates for mandatory ISO/SOC2 policies.",
//       tag: "Policy",
//       color: "#0ea5e9",
//     },
//     {
//       icon: Video,
//       title: "Platform Walkthrough Video",
//       desc: "30-minute guided tour of all modules in the platform.",
//       tag: "Platform",
//       color: "#f59e0b",
//     },
//     {
//       icon: Award,
//       title: "Audit Readiness Checklist",
//       desc: "Step-by-step checklist to prepare for your first external audit.",
//       tag: "Audit",
//       color: "#22c55e",
//     },
//     {
//       icon: Users,
//       title: "Team Roles & Responsibilities",
//       desc: "Who does what in your compliance program.",
//       tag: "Team",
//       color: "#ef4444",
//     },
//   ];

//   // ─────────────────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           minHeight: 400,
//           gap: 12,
//           color: "#6366f1",
//           fontSize: 16,
//           fontWeight: 600,
//         }}
//       >
//         <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
//         Loading onboarding…
//         <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//       </div>
//     );
//   }

//   // ── Stale token screen ────────────────────────────────────────────────────────
//   if (error === "STALE_TOKEN") {
//     return (
//       <div
//         style={{
//           maxWidth: 480,
//           margin: "80px auto",
//           textAlign: "center",
//           padding: "0 24px",
//         }}
//       >
//         <div style={{ fontSize: 56, marginBottom: 20 }}>🔐</div>
//         <h2
//           style={{
//             fontSize: 22,
//             fontWeight: 800,
//             color: "#1e293b",
//             marginBottom: 12,
//           }}
//         >
//           Session needs a refresh
//         </h2>
//         <p
//           style={{
//             fontSize: 15,
//             color: "#64748b",
//             lineHeight: 1.7,
//             marginBottom: 28,
//           }}
//         >
//           Your login session is missing organization details. This happens when
//           your account was set up recently or your session is outdated.
//           <br />
//           <br />
//           <strong>Please log out and log back in</strong> — it takes 10 seconds
//           and fixes this.
//         </p>
//         <button
//           onClick={() => {
//             sessionStorage.clear();
//             window.location.href = "/login";
//           }}
//           style={{
//             background: "#6366f1",
//             color: "#fff",
//             border: "none",
//             padding: "12px 28px",
//             borderRadius: 8,
//             fontWeight: 700,
//             fontSize: 15,
//             cursor: "pointer",
//           }}
//         >
//           Log out &amp; refresh session
//         </button>
//       </div>
//     );
//   }

//   // ── All done — Greeting screen ─────────────────────────────────────────────
//   if (
//     progress?.step1Completed &&
//     progress?.step2Completed &&
//     progress?.step3Completed
//   ) {
//     return (
//       <div
//         style={{
//           maxWidth: 640,
//           margin: "60px auto",
//           textAlign: "center",
//           padding: "0 24px",
//         }}
//       >
//         <style>{`@keyframes pop{0%{transform:scale(0.5);opacity:0}80%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
//         <div style={{ animation: "pop 0.6s ease forwards", fontSize: 72 }}>
//           <PartyPopper size={72} color="#6366f1" />
//         </div>
//         <h1
//           style={{
//             fontSize: 32,
//             fontWeight: 800,
//             color: "#1e293b",
//             margin: "20px 0 12px",
//           }}
//         >
//           Welcome aboard, {org?.name}!
//         </h1>
//         <p
//           style={{
//             fontSize: 16,
//             color: "#64748b",
//             lineHeight: 1.7,
//             marginBottom: 32,
//           }}
//         >
//           Your organization is fully set up and ready to go. Your compliance
//           journey starts now — head to your dashboard to begin.
//         </p>
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3,1fr)",
//             gap: 16,
//             marginBottom: 36,
//           }}
//         >
//           {[
//             { icon: Building2, label: "Business Info", color: "#6366f1" },
//             { icon: Shield, label: "Modules & Team", color: "#8b5cf6" },
//             { icon: GraduationCap, label: "Training", color: "#22c55e" },
//           ].map(({ icon: Icon, label, color }) => (
//             <div
//               key={label}
//               style={{
//                 background: "#f8fafc",
//                 border: "1.5px solid #e2e8f0",
//                 borderRadius: 12,
//                 padding: "20px 12px",
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 gap: 10,
//               }}
//             >
//               <CheckCircle2 size={28} color={color} />
//               <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
//                 {label}
//               </span>
//             </div>
//           ))}
//         </div>
//         <Btn
//           onClick={() => (window.location.href = "/admin/dashboard")}
//           variant="primary"
//         >
//           Go to Dashboard <ChevronRight size={16} />
//         </Btn>
//       </div>
//     );
//   }

//   // ─── Main Wizard ──────────────────────────────────────────────────────────
//   return (
//     <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px" }}>
//       <style>{`
//         @keyframes spin{to{transform:rotate(360deg)}}
//         @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
//         .onb-fade{animation:fadeIn 0.3s ease}
//         input:focus,select:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.12)}
//       `}</style>

//       {/* Page header */}
//       <div style={{ marginBottom: 32 }}>
//         <h1
//           style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", margin: 0 }}
//         >
//           Organization Setup
//         </h1>
//         <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
//           Complete the three steps below to finish setting up{" "}
//           <strong>{org?.name}</strong>.
//         </p>

//         {/* Progress bar */}
//         <div
//           style={{
//             marginTop: 20,
//             display: "flex",
//             alignItems: "center",
//             gap: 12,
//           }}
//         >
//           {[1, 2, 3].map((n) => {
//             const done =
//               n === 1
//                 ? progress?.step1Completed
//                 : n === 2
//                   ? progress?.step2Completed
//                   : progress?.step3Completed;
//             return (
//               <React.Fragment key={n}>
//                 <div
//                   style={{
//                     height: 6,
//                     flex: 1,
//                     borderRadius: 4,
//                     background: done ? "#6366f1" : "#e2e8f0",
//                     transition: "background 0.4s ease",
//                   }}
//                 />
//               </React.Fragment>
//             );
//           })}
//           <span
//             style={{
//               fontSize: 13,
//               fontWeight: 600,
//               color: "#6366f1",
//               whiteSpace: "nowrap",
//             }}
//           >
//             {progress?.step3Completed
//               ? 3
//               : progress?.step2Completed
//                 ? 2
//                 : progress?.step1Completed
//                   ? 1
//                   : 0}{" "}
//             / 3
//           </span>
//         </div>
//       </div>

//       {/* Error banner */}
//       {error && (
//         <div
//           style={{
//             background: "#fef2f2",
//             border: "1.5px solid #fecaca",
//             borderRadius: 10,
//             padding: "12px 16px",
//             display: "flex",
//             alignItems: "center",
//             gap: 10,
//             marginBottom: 20,
//             color: "#ef4444",
//             fontSize: 14,
//             fontWeight: 500,
//           }}
//         >
//           <AlertCircle size={16} />
//           <span style={{ flex: 1 }}>{error}</span>
//           <X
//             size={16}
//             style={{ cursor: "pointer" }}
//             onClick={() => setError(null)}
//           />
//         </div>
//       )}

//       {/* ──── STEP 1: Business Information ──────────────────────────────────── */}
//       <StepCard
//         number={1}
//         title="Business Information"
//         icon={Building2}
//         status={
//           progress?.step1Completed
//             ? "done"
//             : activeStep === 1
//               ? "open"
//               : "closed"
//         }
//         locked={false}
//         onClick={() => setActiveStep(1)}
//       >
//         <div className="onb-fade">
//           {/* Read-only chips from super admin */}
//           <div
//             style={{
//               background: "#f8fafc",
//               border: "1.5px solid #e2e8f0",
//               borderRadius: 10,
//               padding: "14px 16px",
//               marginBottom: 24,
//               marginTop: 8,
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 12,
//                 fontWeight: 700,
//                 color: "#94a3b8",
//                 marginBottom: 10,
//                 letterSpacing: "0.05em",
//               }}
//             >
//               SET BY SUPER ADMIN
//             </div>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//               <Tag label={`Org: ${org?.name}`} color="#6366f1" />
//               {(org?.frameworks || []).map((f) => (
//                 <Tag key={f} label={f} color="#8b5cf6" />
//               ))}
//               {org?.tprmEnabled && <Tag label="TPRM Enabled" color="#0ea5e9" />}
//               <Tag
//                 label={`Max Users: ${seatLimit > 0 ? seatLimit : "Unlimited"}`}
//                 color="#f59e0b"
//               />
//             </div>
//           </div>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "0 24px",
//             }}
//           >
//             <Field label="Industry / Sector" required>
//               <Select
//                 value={biz.industry}
//                 onChange={(e) => setBiz({ ...biz, industry: e.target.value })}
//                 options={INDUSTRY_OPTIONS}
//               />
//             </Field>

//             <Field
//               label="Organization Website"
//               hint="e.g. https://yourcompany.com"
//             >
//               <Input
//                 value={biz.website}
//                 onChange={(e) => setBiz({ ...biz, website: e.target.value })}
//                 placeholder="https://"
//                 prefix={<Globe size={14} />}
//               />
//             </Field>

//             <Field label="Office / HQ Address" required>
//               <Input
//                 value={biz.address}
//                 onChange={(e) => setBiz({ ...biz, address: e.target.value })}
//                 placeholder="Street, City, State, Country"
//                 prefix={<MapPin size={14} />}
//               />
//             </Field>

//             <Field label="Contact Phone">
//               <Input
//                 value={biz.phone}
//                 onChange={(e) => setBiz({ ...biz, phone: e.target.value })}
//                 placeholder="+91 98765 43210"
//                 prefix={<Phone size={14} />}
//               />
//             </Field>

//             <Field label="Total Employees" required>
//               <Select
//                 value={biz.totalEmployees}
//                 onChange={(e) =>
//                   setBiz({ ...biz, totalEmployees: e.target.value })
//                 }
//                 options={[
//                   { value: "1-50", label: "1–50" },
//                   { value: "51-200", label: "51–200" },
//                   { value: "201-500", label: "201–500" },
//                   { value: "501-2000", label: "501–2000" },
//                   { value: "2001+", label: "2001+" },
//                 ]}
//               />
//             </Field>

//             <Field label="Number of Office Locations">
//               <Input
//                 type="number"
//                 value={biz.officeLocations}
//                 onChange={(e) =>
//                   setBiz({ ...biz, officeLocations: e.target.value })
//                 }
//                 placeholder="e.g. 3"
//               />
//             </Field>

//             <Field label="Compliance Team Size">
//               <Input
//                 type="number"
//                 value={biz.complianceTeamSize}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (seatLimit > 0 && parseInt(val, 10) > seatLimit) {
//                     setTeamSizeError(
//                       `Under your subscription plan, only ${seatLimit} users are allowed. Please upgrade your plan or purchase additional user seats to add more.`,
//                     );
//                   } else {
//                     setTeamSizeError(null);
//                     setBiz({ ...biz, complianceTeamSize: val });
//                   }
//                 }}
//                 placeholder="e.g. 5"
//               />
//               {teamSizeError && (
//                 <div
//                   style={{
//                     color: "#ef4444",
//                     fontSize: 12,
//                     marginTop: 6,
//                     fontWeight: 500,
//                   }}
//                 >
//                   <AlertCircle
//                     size={14}
//                     style={{
//                       display: "inline",
//                       verticalAlign: "middle",
//                       marginRight: 4,
//                     }}
//                   />
//                   <span style={{ verticalAlign: "middle" }}>
//                     {teamSizeError}
//                   </span>
//                 </div>
//               )}
//             </Field>

//             <Field
//               label="Email Domain"
//               hint="Primary domain for your organization"
//             >
//               <Input
//                 value={biz.domain}
//                 onChange={(e) => setBiz({ ...biz, domain: e.target.value })}
//                 placeholder="yourdomain.com"
//               />
//             </Field>
//           </div>

//           <div
//             style={{
//               borderTop: "1.5px solid #f1f5f9",
//               paddingTop: 20,
//               marginTop: 4,
//               marginBottom: 8,
//               fontWeight: 700,
//               fontSize: 14,
//               color: "#475569",
//             }}
//           >
//             Primary Compliance Contact
//           </div>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr 1fr",
//               gap: "0 24px",
//             }}
//           >
//             <Field label="Full Name" required hint="Auto-filled from your login — editable">
//               <Input
//                 value={biz.primaryContactName}
//                 onChange={(e) =>
//                   setBiz({ ...biz, primaryContactName: e.target.value })
//                 }
//                 placeholder="Jane Smith"
//                 prefix={<User size={14} />}
//               />
//             </Field>
//             <Field label="Email" required hint="Auto-filled from your login — editable">
//               <Input
//                 type="email"
//                 value={biz.primaryContactEmail}
//                 onChange={(e) =>
//                   setBiz({ ...biz, primaryContactEmail: e.target.value })
//                 }
//                 placeholder="jane@company.com"
//                 prefix={<Mail size={14} />}
//               />
//             </Field>
//             <Field label="Phone">
//               <Input
//                 value={biz.primaryContactPhone}
//                 onChange={(e) =>
//                   setBiz({ ...biz, primaryContactPhone: e.target.value })
//                 }
//                 placeholder="+91 …"
//                 prefix={<Phone size={14} />}
//               />
//             </Field>
//           </div>

//           <div style={{ marginTop: 12 }}>
//             <Btn onClick={saveStep1} loading={step1Saving} variant="primary">
//               Save & Continue <ChevronRight size={16} />
//             </Btn>
//           </div>
//         </div>
//       </StepCard>

//       {/* ──── STEP 2: Module-Based User Setup ───────────────────────────────── */}
//       <StepCard
//         number={2}
//         title="Module Setup & Team"
//         icon={Shield}
//         status={
//           progress?.step2Completed
//             ? "done"
//             : !progress?.step1Completed
//               ? "locked"
//               : activeStep === 2
//                 ? "open"
//                 : "closed"
//         }
//         locked={!progress?.step1Completed}
//         onClick={() => progress?.step1Completed && setActiveStep(2)}
//       >
//         <div className="onb-fade">
//           {/* ── Departments section ── */}
//           <div
//             style={{
//               background: "#f8fafc",
//               borderRadius: 12,
//               padding: 20,
//               marginBottom: 28,
//               marginTop: 8,
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 8,
//                 marginBottom: 14,
//               }}
//             >
//               <Briefcase size={16} color="#6366f1" />
//               <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
//                 Departments
//               </span>
//               <span style={{ fontSize: 12, color: "#94a3b8" }}>
//                 — create departments first before adding users
//               </span>
//             </div>

//             {/* Existing departments */}
//             {departments.length > 0 && (
//               <div
//                 style={{
//                   display: "flex",
//                   flexWrap: "wrap",
//                   gap: 8,
//                   marginBottom: 12,
//                 }}
//               >
//                 {departments.map((d) => (
//                   <div
//                     key={d.id}
//                     style={{
//                       display: "inline-flex",
//                       alignItems: "center",
//                       gap: 6,
//                       background: "#fff",
//                       border: "1.5px solid #e2e8f0",
//                       borderRadius: 20,
//                       padding: "5px 12px",
//                       fontSize: 13,
//                       fontWeight: 500,
//                       color: "#475569",
//                     }}
//                   >
//                     {d.name}
//                     <X
//                       size={12}
//                       style={{ cursor: "pointer", color: "#94a3b8" }}
//                       onClick={() => deleteDepartment(d.id)}
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}

//             {addingDept ? (
//               <div
//                 style={{
//                   background: "#fff",
//                   padding: "16px",
//                   borderRadius: "12px",
//                   border: "1px solid #e2e8f0",
//                 }}
//               >
//                 {lastCreatedDept ? (
//                   <div style={{ textAlign: "center", padding: "12px 0" }}>
//                     <div
//                       style={{
//                         color: "#10b981",
//                         fontWeight: 600,
//                         marginBottom: "16px",
//                       }}
//                     >
//                       ✓ Your department "{lastCreatedDept}" is created.
//                     </div>
//                     <Btn
//                       onClick={() => setLastCreatedDept(null)}
//                       variant="secondary"
//                     >
//                       <Plus size={14} /> Add more departments
//                     </Btn>
//                   </div>
//                 ) : (
//                   <CreateDept
//                     embedded={true}
//                     onSuccess={(deptName) => {
//                       setLastCreatedDept(deptName);
//                       fetchDepartments();
//                     }}
//                     onCancel={() => {
//                       setAddingDept(false);
//                       setLastCreatedDept(null);
//                     }}
//                   />
//                 )}
//               </div>
//             ) : (
//               <Btn onClick={() => setAddingDept(true)} variant="secondary">
//                 <Plus size={14} /> Add Department
//               </Btn>
//             )}
//           </div>

//           {/* ── User creation section ── */}
//           <div style={{ marginBottom: 20 }}>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 8,
//                 marginBottom: 16,
//               }}
//             >
//               <Users size={16} color="#6366f1" />
//               <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
//                 Add Team Members
//               </span>
//               <Tag
//                 label={
//                   seatLimit > 0
//                     ? `${users.length} / ${seatLimit} seats used`
//                     : "Unlimited seats"
//                 }
//                 color={
//                   seatLimit > 0 && users.length >= seatLimit
//                     ? "#ef4444"
//                     : "#f59e0b"
//                 }
//               />
//             </div>

//             {/* User form */}
//             {departments.length === 0 ? (
//               <div
//                 style={{
//                   background: "#f8fafc",
//                   border: "1.5px dashed #cbd5e1",
//                   borderRadius: 12,
//                   padding: "32px 20px",
//                   marginBottom: 16,
//                   textAlign: "center",
//                   color: "#64748b",
//                 }}
//               >
//                 <div
//                   style={{
//                     marginBottom: 12,
//                     display: "flex",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <Briefcase size={32} color="#94a3b8" />
//                 </div>
//                 <div
//                   style={{
//                     fontWeight: 600,
//                     fontSize: 15,
//                     color: "#1e293b",
//                     marginBottom: 4,
//                   }}
//                 >
//                   Department Required
//                 </div>
//                 <div style={{ fontSize: 13, maxWidth: 400, margin: "0 auto" }}>
//                   Please create at least one department above before you can
//                   start adding team members to your organization.
//                 </div>
//               </div>
//             ) : (
//               <div
//                 style={{
//                   background: "#f8fafc",
//                   border: "1.5px dashed #cbd5e1",
//                   borderRadius: 12,
//                   padding: 20,
//                   marginBottom: 16,
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "1fr 1fr",
//                     gap: "0 24px",
//                   }}
//                 >
//                   <Field label="Full Name" required>
//                     <Input
//                       value={newUser.name}
//                       onChange={(e) =>
//                         setNewUser({ ...newUser, name: e.target.value })
//                       }
//                       placeholder="John Doe"
//                       prefix={<User size={14} />}
//                     />
//                   </Field>
//                   <Field label="Email" required>
//                     <Input
//                       type="email"
//                       value={newUser.email}
//                       onChange={(e) =>
//                         setNewUser({ ...newUser, email: e.target.value })
//                       }
//                       placeholder="john@company.com"
//                       prefix={<Mail size={14} />}
//                     />
//                   </Field>
//                   <Field label="Role" required>
//                     <Select
//                       value={newUser.role}
//                       onChange={(e) =>
//                         setNewUser({ ...newUser, role: e.target.value })
//                       }
//                       options={ROLE_OPTIONS}
//                     />
//                   </Field>
//                   <Field label="Department">
//                     <Select
//                       value={newUser.department}
//                       onChange={(e) =>
//                         setNewUser({ ...newUser, department: e.target.value })
//                       }
//                       options={departments.map((d) => ({
//                         value: d.id,
//                         label: d.name,
//                       }))}
//                     />
//                   </Field>
//                   <Field label="Temporary Password" required>
//                     <Input
//                       type="password"
//                       value={newUser.password}
//                       onChange={(e) =>
//                         setNewUser({ ...newUser, password: e.target.value })
//                       }
//                       placeholder="Min 8 characters"
//                     />
//                   </Field>
//                 </div>
//                 {lastCreatedUser ? (
//                   <div style={{ textAlign: "center", padding: "12px 0" }}>
//                     <div
//                       style={{
//                         color: "#10b981",
//                         fontWeight: 600,
//                         marginBottom: "16px",
//                       }}
//                     >
//                       ✓ User "{lastCreatedUser}" is created.
//                     </div>
//                     <Btn
//                       onClick={() => setLastCreatedUser(null)}
//                       variant="secondary"
//                     >
//                       <Plus size={14} /> Add more user
//                     </Btn>
//                   </div>
//                 ) : (
//                   <Btn
//                     onClick={createUser}
//                     loading={userSaving}
//                     variant="secondary"
//                   >
//                     <Plus size={14} /> Create User
//                   </Btn>
//                 )}
//               </div>
//             )}

//             {/* Users added so far */}
//             {users.length > 0 && (
//               <div>
//                 <div
//                   style={{
//                     fontSize: 13,
//                     fontWeight: 600,
//                     color: "#94a3b8",
//                     marginBottom: 10,
//                   }}
//                 >
//                   USERS ADDED THIS SESSION
//                 </div>
//                 {users.map((u) => (
//                   <div
//                     key={u.email}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 12,
//                       padding: "10px 16px",
//                       background: "#fff",
//                       border: "1.5px solid #e2e8f0",
//                       borderRadius: 10,
//                       marginBottom: 8,
//                     }}
//                   >
//                     <div
//                       style={{
//                         width: 34,
//                         height: 34,
//                         borderRadius: "50%",
//                         background: "#eef2ff",
//                         color: "#6366f1",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontWeight: 700,
//                         fontSize: 14,
//                       }}
//                     >
//                       {u.name?.charAt(0)?.toUpperCase() || "U"}
//                     </div>
//                     <div style={{ flex: 1 }}>
//                       <div
//                         style={{
//                           fontWeight: 600,
//                           fontSize: 14,
//                           color: "#1e293b",
//                         }}
//                       >
//                         {u.name}
//                       </div>
//                       <div style={{ fontSize: 12, color: "#64748b" }}>
//                         {u.email}
//                       </div>
//                     </div>
//                     <Tag
//                       label={(Array.isArray(u.role) ? u.role[0] : u.role)?.replace(
//                         /_/g,
//                         " ",
//                       )}
//                       color="#6366f1"
//                     />
//                     <Trash2
//                       size={14}
//                       color="#ef4444"
//                       style={{ cursor: "pointer" }}
//                       onClick={() => removeUser(u.email)}
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div style={{ marginTop: 16 }}>
//             <Btn
//               onClick={saveStep2}
//               loading={step2Saving}
//               variant="primary"
//               disabled={departments.length === 0}
//               title={
//                 departments.length === 0
//                   ? "Create at least one department to continue"
//                   : ""
//               }
//             >
//               Save & Continue <ChevronRight size={16} />
//             </Btn>
//             <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 12 }}>
//               You can add more users later from the Users section.
//             </span>
//           </div>
//         </div>
//       </StepCard>

//       {/* ──── STEP 3: Training ──────────────────────────────────────────────── */}
//       <StepCard
//         number={3}
//         title="Training"
//         icon={GraduationCap}
//         status={
//           progress?.step3Completed
//             ? "done"
//             : !progress?.step2Completed
//               ? "locked"
//               : activeStep === 3
//                 ? "open"
//                 : "closed"
//         }
//         locked={!progress?.step2Completed}
//         onClick={() => progress?.step2Completed && setActiveStep(3)}
//       >
//         <div className="onb-fade">
//           {/* ── Calvant trainer notice ── */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "flex-start",
//               gap: 14,
//               background: "#eef2ff",
//               border: "1.5px solid #c7d2fe",
//               borderRadius: 12,
//               padding: "16px 20px",
//               marginBottom: 24,
//               marginTop: 8,
//             }}
//           >
//             <div style={{ fontSize: 24, flexShrink: 0 }}>🎓</div>
//             <div>
//               <div
//                 style={{
//                   fontWeight: 700,
//                   fontSize: 14,
//                   color: "#3730a3",
//                   marginBottom: 4,
//                 }}
//               >
//                 Your training will be conducted by a Calvant trainer
//               </div>
//               <div style={{ fontSize: 13, color: "#4338ca", lineHeight: 1.6 }}>
//                 Once you complete this step, our team will contact
//                 <strong>
//                   {" "}
//                   {biz.primaryContactName || "your primary contact"}
//                 </strong>{" "}
//                 at
//                 <strong>
//                   {" "}
//                   {biz.primaryContactEmail || "the email provided in Step 1"}
//                 </strong>{" "}
//                 to confirm the session date and details. No action needed from
//                 you beyond picking a preferred date below.
//               </div>
//             </div>
//           </div>

//           {/* Resource cards — pre-read before the session */}
//           <div
//             style={{
//               fontSize: 13,
//               fontWeight: 700,
//               color: "#94a3b8",
//               marginBottom: 12,
//               letterSpacing: "0.05em",
//             }}
//           >
//             REVIEW BEFORE YOUR SESSION
//           </div>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(3,1fr)",
//               gap: 14,
//               marginBottom: 28,
//             }}
//           >
//             {TRAINING_RESOURCES.map(
//               ({ icon: Icon, title, desc, tag, color }) => (
//                 <div
//                   key={title}
//                   style={{
//                     background: "#fff",
//                     border: "1.5px solid #e2e8f0",
//                     borderRadius: 12,
//                     padding: 18,
//                     transition: "box-shadow 0.15s, border-color 0.15s",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.boxShadow =
//                       "0 4px 16px rgba(0,0,0,0.08)";
//                     e.currentTarget.style.borderColor = color;
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.boxShadow = "none";
//                     e.currentTarget.style.borderColor = "#e2e8f0";
//                   }}
//                 >
//                   <div
//                     style={{
//                       width: 38,
//                       height: 38,
//                       borderRadius: 10,
//                       background: color + "18",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       marginBottom: 10,
//                     }}
//                   >
//                     <Icon size={18} color={color} />
//                   </div>
//                   <div
//                     style={{
//                       fontWeight: 700,
//                       fontSize: 13,
//                       color: "#1e293b",
//                       marginBottom: 4,
//                     }}
//                   >
//                     {title}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 12,
//                       color: "#64748b",
//                       lineHeight: 1.5,
//                       marginBottom: 10,
//                     }}
//                   >
//                     {desc}
//                   </div>
//                   <Tag label={tag} color={color} />
//                 </div>
//               ),
//             )}
//           </div>

//           {/* Preferred date — only field root needs to fill */}
//           <div
//             style={{
//               background: "#f8fafc",
//               borderRadius: 12,
//               padding: 20,
//               marginBottom: 20,
//               border: "1.5px solid #e2e8f0",
//             }}
//           >
//             <div
//               style={{
//                 fontWeight: 700,
//                 fontSize: 14,
//                 color: "#1e293b",
//                 marginBottom: 4,
//               }}
//             >
//               Preferred Training Date
//             </div>
//             <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
//               Pick a date that works for your team. Our trainer will confirm
//               availability and send a calendar invite to{" "}
//               {biz.primaryContactEmail || "your primary contact"}.
//             </div>
//             <Field
//               label="Preferred date"
//               hint="Optional — leave blank if you have no preference and our team will suggest one"
//             >
//               <Input
//                 type="date"
//                 value={training.preferredDate}
//                 onChange={(e) =>
//                   setTraining({ ...training, preferredDate: e.target.value })
//                 }
//               />
//             </Field>
//           </div>

//           {/* Acknowledgement */}
//           <label
//             style={{
//               display: "flex",
//               alignItems: "flex-start",
//               gap: 12,
//               cursor: "pointer",
//               padding: 16,
//               background: training.acknowledged ? "#f0fdf4" : "#fff",
//               border: `1.5px solid ${training.acknowledged ? "#22c55e" : "#e2e8f0"}`,
//               borderRadius: 10,
//               marginBottom: 20,
//               transition: "all 0.2s",
//             }}
//           >
//             <input
//               type="checkbox"
//               checked={training.acknowledged}
//               onChange={(e) =>
//                 setTraining({ ...training, acknowledged: e.target.checked })
//               }
//               style={{
//                 marginTop: 2,
//                 width: 16,
//                 height: 16,
//                 accentColor: "#22c55e",
//                 cursor: "pointer",
//               }}
//             />
//             <span style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
//               I confirm I have reviewed the pre-training materials above and
//               understand the roles and responsibilities in the compliance
//               program. I authorise Calvant to contact
//               <strong>
//                 {" "}
//                 {biz.primaryContactName || "the primary contact"}
//               </strong>{" "}
//               to schedule the onboarding session.
//             </span>
//           </label>

//           <Btn
//             onClick={saveStep3}
//             loading={step3Saving}
//             variant="success"
//             disabled={!training.acknowledged}
//           >
//             Complete Setup <CheckCircle2 size={16} />
//           </Btn>
//           {!training.acknowledged && (
//             <p
//               style={{
//                 fontSize: 12,
//                 color: "#94a3b8",
//                 marginTop: 8,
//                 marginBottom: 0,
//               }}
//             >
//               Tick the acknowledgement above to enable this button.
//             </p>
//           )}
//         </div>
//       </StepCard>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect, useCallback } from "react";
import adminAxios from "../../api/adminAxios";
import {
  CheckCircle2,
  Lock,
  Building2,
  Landmark,
  Shield,
  ChevronRight,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Loader2,
  PartyPopper,
  X,
  AlertCircle,
  FileUp,
  FileCheck2,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import useModuleEntitlements from "../../hooks/useModuleEntitlements";
import CreateDept from "../Departments/CreateDept";

const API = "https://api.calvant.com/user-service";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ax = adminAxios; // already has Bearer + x-org + x-role interceptors
const MAX_OFFICE_LOCATIONS = 20; // sanity cap so a typo doesn't render 9999 inputs

// ─── Sub-component: Step Header ───────────────────────────────────────────────
function StepCard({
  number,
  title,
  icon: Icon,
  status,
  locked,
  onClick,
  children,
}) {
  const isOpen = status === "open";
  const isDone = status === "done";

  return (
    <div
      style={{
        border: isDone
          ? "1.5px solid #22c55e"
          : isOpen
            ? "1.5px solid #6366f1"
            : "1.5px solid #e2e8f0",
        borderRadius: 16,
        marginBottom: 20,
        background: "#fff",
        overflow: "hidden",
        boxShadow: isOpen
          ? "0 4px 24px rgba(99,102,241,0.08)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header row */}
      <div
        onClick={!locked ? onClick : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "20px 24px",
          cursor: locked ? "not-allowed" : "pointer",
          userSelect: "none",
          background: isDone
            ? "linear-gradient(90deg,#f0fdf4,#fff)"
            : isOpen
              ? "linear-gradient(90deg,#eef2ff,#fff)"
              : "#fafafa",
        }}
      >
        {/* Step number bubble */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: isDone ? "#22c55e" : isOpen ? "#6366f1" : "#e2e8f0",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {isDone ? (
            <CheckCircle2 size={22} />
          ) : locked ? (
            <Lock size={18} />
          ) : (
            number
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon
              size={18}
              color={isDone ? "#22c55e" : isOpen ? "#6366f1" : "#94a3b8"}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: locked
                  ? "#94a3b8"
                  : isDone
                    ? "#15803d"
                    : isOpen
                      ? "#4f46e5"
                      : "#1e293b",
              }}
            >
              {title}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            {locked
              ? "Complete previous step to unlock"
              : isDone
                ? "Completed ✓"
                : isOpen
                  ? "In progress — fill in the details below"
                  : "Click to begin"}
          </div>
        </div>

        {!locked && (
          <ChevronRight
            size={20}
            color="#cbd5e1"
            style={{
              transform: isOpen ? "rotate(90deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        )}
      </div>

      {/* Body — only rendered when open */}
      {isOpen && <div style={{ padding: "0 24px 28px" }}>{children}</div>}
    </div>
  );
}

// ─── Sub-component: Field ─────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "#475569",
          marginBottom: 6,
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly,
  prefix,
}) {
  return (
    <div style={{ position: "relative" }}>
      {prefix && (
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
          }}
        >
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: "100%",
          padding: prefix ? "10px 12px 10px 36px" : "10px 12px",
          border: "1.5px solid",
          borderColor: readOnly ? "#f1f5f9" : "#e2e8f0",
          borderRadius: 8,
          fontSize: 14,
          color: readOnly ? "#94a3b8" : "#1e293b",
          background: readOnly ? "#f8fafc" : "#fff",
          boxSizing: "border-box",
          outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => !readOnly && (e.target.style.borderColor = "#6366f1")}
        onBlur={(e) => !readOnly && (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "10px 12px",
        border: "1.5px solid #e2e8f0",
        borderRadius: 8,
        fontSize: 14,
        color: "#1e293b",
        background: "#fff",
        boxSizing: "border-box",
        outline: "none",
        cursor: "pointer",
      }}
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function FileDropInput({ file, existingName, onChange, accept, label }) {
  const inputId = `file-input-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label
        htmlFor={inputId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "1.5px dashed #cbd5e1",
          borderRadius: 10,
          padding: "14px 16px",
          cursor: "pointer",
          background: file || existingName ? "#f0fdf4" : "#f8fafc",
          borderColor: file || existingName ? "#86efac" : "#cbd5e1",
        }}
      >
        {file || existingName ? (
          <FileCheck2 size={18} color="#22c55e" />
        ) : (
          <FileUp size={18} color="#94a3b8" />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
            {file
              ? file.name
              : existingName
                ? existingName
                : "Click to upload document"}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {file || existingName
              ? "Click to replace"
              : "PDF, JPG or PNG — max 10MB"}
          </div>
        </div>
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={onChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

function Btn({
  children,
  onClick,
  variant = "primary",
  disabled,
  loading,
  small,
}) {
  const styles = {
    primary: { background: "#6366f1", color: "#fff", border: "none" },
    secondary: {
      background: "#f1f5f9",
      color: "#475569",
      border: "1.5px solid #e2e8f0",
    },
    danger: {
      background: "#fef2f2",
      color: "#ef4444",
      border: "1.5px solid #fecaca",
    },
    success: { background: "#22c55e", color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        padding: small ? "7px 14px" : "10px 22px",
        borderRadius: 8,
        fontWeight: 600,
        fontSize: small ? 13 : 14,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        opacity: disabled || loading ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {loading && (
        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
      )}
      {children}
    </button>
  );
}

function Tag({ label, color = "#6366f1" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        background: color + "18",
        color,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingModule() {
  const { seatLimit } = useModuleEntitlements();
  const [progress, setProgress] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState(null);
  const [teamSizeError, setTeamSizeError] = useState(null);

  // ── Step 1 state — Business Information ────────────────────────────────────
  const [biz, setBiz] = useState({
    legalEntityName: "",
    phone: "",
    website: "",
    industry: "",
    totalEmployees: "",
    officeLocations: "",
    complianceTeamSize: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    domain: "",
  });
  // One address per office location — length is kept in sync with
  // biz.officeLocations (e.g. officeLocations = "3" -> 3 address inputs).
  const [officeAddresses, setOfficeAddresses] = useState([""]);
  const [step1Saving, setStep1Saving] = useState(false);

  // ── Step 2 state — Finance ──────────────────────────────────────────────────
  const [finance, setFinance] = useState({
    officialEmail: "",
    registeredOfficeAddress: "",
    gstNumber: "",
    cinNumber: "",
  });
  const [financeDoc, setFinanceDoc] = useState(null);
  const [step2Saving, setStep2Saving] = useState(false);

  // ── Step 3 state — Team Setup (departments + users) ─────────────────────────
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [deptSaving, setDeptSaving] = useState(false);
  const [addingDept, setAddingDept] = useState(false);
  const [lastCreatedDept, setLastCreatedDept] = useState(null);
  const [users, setUsers] = useState([]);
  const [lastCreatedUser, setLastCreatedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    password: "",
    modules: [],
  });
  const [userSaving, setUserSaving] = useState(false);
  const [step3Saving, setStep3Saving] = useState(false);

  // ── Load onboarding data on mount ──────────────────────────────────────────
  const fetchOnboarding = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ax.get(`${API}/api/onboarding`);
      const { progress: p, organization: o } = res.data;
      setProgress(p);
      setOrg(o);
      // The root login that created this org — used to auto-fill the
      // Primary Contact fields below instead of asking for them again.
      let rootLogin = {};
      try {
        const u = JSON.parse(sessionStorage.getItem("user") || "{}");
        rootLogin = { name: u.name || u.username || "", email: u.email || "" };
      } catch {
        rootLogin = {};
      }
      // Pre-fill step 1 from org / saved progress
      setBiz((prev) => ({
        ...prev,
        legalEntityName: o?.name || prev.legalEntityName,
        phone: o.phone || "",
        website: o.website || "",
        primaryContactName: rootLogin.name || prev.primaryContactName,
        primaryContactEmail: rootLogin.email || prev.primaryContactEmail,
        ...(p.businessInfo || {}),
      }));
      if (p.businessInfo?.officeAddresses?.length) {
        setOfficeAddresses(p.businessInfo.officeAddresses);
      } else if (p.businessInfo?.address) {
        // Backward compatibility with records saved before this field existed
        setOfficeAddresses([p.businessInfo.address]);
      }
      if (p.financeInfo) {
        setFinance((prev) => ({ ...prev, ...p.financeInfo }));
      }
      // Determine active step
      if (p.step3Completed) setActiveStep(3);
      else if (p.step2Completed) setActiveStep(3);
      else if (p.step1Completed) setActiveStep(2);
      else setActiveStep(1);
      // Load departments from this org (needed for Step 3)
      const deptRes = await ax.get(`${API}/api/departments`);
      setDepartments(deptRes.data || []);
    } catch (e) {
      if (e.response?.status === 422 || e.response?.status === 403) {
        setError("STALE_TOKEN");
      } else {
        setError("Failed to load onboarding data. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  const fetchDepartments = async () => {
    try {
      const deptRes = await ax.get(`${API}/api/departments`);
      setDepartments(deptRes.data || []);
    } catch (e) {
      console.error("Failed to fetch departments", e);
    }
  };

  // ── Keep officeAddresses array length in sync with officeLocations count ──
  const handleOfficeLocationsChange = (e) => {
    const raw = e.target.value;
    setBiz((prev) => ({ ...prev, officeLocations: raw }));

    const count = parseInt(raw, 10);
    if (!raw || isNaN(count) || count < 1) {
      setOfficeAddresses([""]);
      return;
    }
    const clamped = Math.min(count, MAX_OFFICE_LOCATIONS);
    setOfficeAddresses((prev) => {
      const next = [...prev];
      if (clamped > next.length) {
        while (next.length < clamped) next.push("");
      } else if (clamped < next.length) {
        next.length = clamped;
      }
      return next;
    });
  };

  const updateOfficeAddress = (index, value) => {
    setOfficeAddresses((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // ── Step 1 save ────────────────────────────────────────────────────────────
  const saveStep1 = async () => {
    const required = [
      "legalEntityName",
      "industry",
      "primaryContactName",
      "primaryContactEmail",
    ];
    for (const f of required) {
      if (!biz[f]) {
        setError(
          `Please fill in: ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        );
        return;
      }
    }
    const requiredAddressCount = Math.max(
      1,
      Math.min(parseInt(biz.officeLocations, 10) || 1, MAX_OFFICE_LOCATIONS),
    );
    const filledAddresses = officeAddresses
      .slice(0, requiredAddressCount)
      .filter((a) => a && a.trim());
    if (filledAddresses.length < requiredAddressCount) {
      setError(
        `Please provide an address for all ${requiredAddressCount} office location(s).`,
      );
      return;
    }
    try {
      setStep1Saving(true);
      setError(null);
      await ax.patch(`${API}/api/onboarding/step1`, {
        businessInfo: {
          ...biz,
          officeAddresses,
          // Kept for backward compatibility with anything still reading the
          // single `address` field — mirrors the first office address.
          address: officeAddresses[0] || "",
          submittedByName: (() => {
            try {
              const u = JSON.parse(sessionStorage.getItem("user") || "{}");
              return (
                u.name || u.username || u.email || biz.primaryContactName || ""
              );
            } catch {
              return biz.primaryContactName || "";
            }
          })(),
          submittedByEmail: (() => {
            try {
              const u = JSON.parse(sessionStorage.getItem("user") || "{}");
              return u.email || biz.primaryContactEmail || "";
            } catch {
              return biz.primaryContactName || "";
            }
          })(),
        },
      });
      const res = await ax.get(`${API}/api/onboarding`);
      setProgress(res.data.progress);
      setActiveStep(2);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save Step 1.");
    } finally {
      setStep1Saving(false);
    }
  };

  // ── Step 2 save — Finance ──────────────────────────────────────────────────
  const saveStep2 = async () => {
    const required = [
      "officialEmail",
      "registeredOfficeAddress",
      "gstNumber",
      "cinNumber",
    ];
    for (const f of required) {
      if (!finance[f]) {
        setError(
          `Please fill in: ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        );
        return;
      }
    }
    if (!financeDoc && !progress?.financeInfo?.documentFileName) {
      setError(
        "Please attach a supporting document (GST certificate / CIN certificate).",
      );
      return;
    }
    try {
      setStep2Saving(true);
      setError(null);
      const formData = new FormData();
      formData.append("officialEmail", finance.officialEmail);
      formData.append(
        "registeredOfficeAddress",
        finance.registeredOfficeAddress,
      );
      formData.append("gstNumber", finance.gstNumber);
      formData.append("cinNumber", finance.cinNumber);
      if (financeDoc) formData.append("document", financeDoc);

      await ax.patch(`${API}/api/onboarding/step2`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await ax.get(`${API}/api/onboarding`);
      setProgress(res.data.progress);
      setActiveStep(3);
    } catch (e) {
      setError(
        typeof e.response?.data === "string"
          ? e.response.data
          : e.response?.data?.message || "Failed to save Step 2.",
      );
    } finally {
      setStep2Saving(false);
    }
  };

  // ── Add department (Step 3) ─────────────────────────────────────────────────
  const addDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      setDeptSaving(true);
      const res = await ax.post(`${API}/api/departments`, {
        name: newDeptName,
      });
      setDepartments((d) => [...d, res.data]);
      setNewDeptName("");
    } catch (e) {
      setError(e.response?.data || "Failed to add department.");
    } finally {
      setDeptSaving(false);
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await ax.delete(`${API}/api/departments/${id}`);
      setDepartments((d) => d.filter((x) => x.id !== id));
    } catch (e) {
      setError("Failed to delete department.");
    }
  };

  const createUser = async () => {
    const req = ["name", "email", "role", "password"];
    for (const f of req) {
      if (!newUser[f]) {
        setError(`Please fill: ${f}`);
        return;
      }
    }
    try {
      setUserSaving(true);
      setError(null);

      const roleArr = newUser.role ? [newUser.role] : [];
      const deptArr = newUser.department ? [newUser.department] : [];

      // Mirror UserForm exactly: org comes from session/JWT, NOT from the onboarding
      // API response object (org?.id may be a different format than the JWT claim)
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const decoded = (() => {
        try {
          return token ? jwtDecode(token) : null;
        } catch {
          return null;
        }
      })();
      const sessionUser = (() => {
        try {
          return JSON.parse(
            sessionStorage.getItem("user") ||
              localStorage.getItem("myObject") ||
              "{}",
          );
        } catch {
          return {};
        }
      })();

      // Priority: JWT claim → session user object → onboarding API org id
      let orgId = decoded?.organization;
      if (orgId && typeof orgId === "object") {
        orgId = orgId.id || orgId._id;
      }
      if (!orgId) {
        if (typeof sessionUser?.organization === "string")
          orgId = sessionUser.organization;
        else if (sessionUser?.organization?.id)
          orgId = sessionUser.organization.id;
        else if (sessionUser?.organization?._id)
          orgId = sessionUser.organization._id;
        else orgId = org?.id || org?._id || "";
      }

      const res = await ax.post(`${API}/api/users/register`, {
        name: newUser.name,
        email: newUser.email.toLowerCase(),
        password: newUser.password,
        role: roleArr,
        department: deptArr,
        organization: orgId,
        modules: [],
        vendors: [],
        isAuditor:
          roleArr.includes("auditor") || roleArr.includes("audit_manager"),
      });

      setUsers((u) => [...u, res.data]);
      setLastCreatedUser(newUser.name);
      setNewUser({
        name: "",
        email: "",
        role: "",
        department: "",
        password: "",
        modules: [],
      });
    } catch (e) {
      console.error("Create User Error:", e.response?.data);
      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          "Failed to create user.",
      );
    } finally {
      setUserSaving(false);
    }
  };

  const removeUser = (email) =>
    setUsers((u) => u.filter((x) => x.email !== email));

  // ── Step 3 save — Team Setup ────────────────────────────────────────────────
  const saveStep3 = async () => {
    try {
      setStep3Saving(true);
      setError(null);
      await ax.patch(`${API}/api/onboarding/step3`, {
        onboardedDepartmentIds: departments.map((d) => d.id),
        onboardedUserIds: users.map((u) => u.id || u.email),
      });
      const res = await ax.get(`${API}/api/onboarding`);
      setProgress(res.data.progress);
    } catch (e) {
      setError(
        typeof e.response?.data === "string"
          ? e.response.data
          : e.response?.data?.message || "Failed to save Step 3.",
      );
    } finally {
      setStep3Saving(false);
    }
  };

  // ── Role options (matching your existing backend roles) ───────────────────
  const ROLE_OPTIONS = [
    { value: "risk_owner", label: "Risk Owner" },
    { value: "risk_manager", label: "Risk Manager" },
    { value: "process_owner", label: "Process Owner" },
    { value: "auditor", label: "Auditor" },
    { value: "policy_manager", label: "Policy Manager" },
    { value: "compliance_officer", label: "Compliance Officer" },
    ...(org?.tprmEnabled
      ? [{ value: "tprm_manager", label: "TPRM Manager" }]
      : []),
  ];

  const INDUSTRY_OPTIONS = [
    { value: "Technology", label: "Technology" },
    { value: "Banking & Finance", label: "Banking & Finance" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Retail", label: "Retail" },
    { value: "Government", label: "Government" },
    { value: "Education", label: "Education" },
    { value: "Energy", label: "Energy" },
    { value: "Telecom", label: "Telecom" },
    { value: "Other", label: "Other" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 12,
          color: "#6366f1",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        Loading onboarding…
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Stale token screen ────────────────────────────────────────────────────────
  if (error === "STALE_TOKEN") {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: "80px auto",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 20 }}>🔐</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#1e293b",
            marginBottom: 12,
          }}
        >
          Session needs a refresh
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "#64748b",
            lineHeight: 1.7,
            marginBottom: 28,
          }}
        >
          Your login session is missing organization details. This happens when
          your account was set up recently or your session is outdated.
          <br />
          <br />
          <strong>Please log out and log back in</strong> — it takes 10 seconds
          and fixes this.
        </p>
        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.href = "/login";
          }}
          style={{
            background: "#6366f1",
            color: "#fff",
            border: "none",
            padding: "12px 28px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Log out &amp; refresh session
        </button>
      </div>
    );
  }

  // ── All done — Greeting screen ─────────────────────────────────────────────
  if (
    progress?.step1Completed &&
    progress?.step2Completed &&
    progress?.step3Completed
  ) {
    return (
      <div
        style={{
          maxWidth: 640,
          margin: "60px auto",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <style>{`@keyframes pop{0%{transform:scale(0.5);opacity:0}80%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
        <div style={{ animation: "pop 0.6s ease forwards", fontSize: 72 }}>
          <PartyPopper size={72} color="#6366f1" />
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#1e293b",
            margin: "20px 0 12px",
          }}
        >
          Welcome aboard, {org?.name}!
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#64748b",
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          Your organization is fully set up and ready to go. Your compliance
          journey starts now — head to your dashboard to begin.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginBottom: 36,
          }}
        >
          {[
            { icon: Building2, label: "Business Info", color: "#6366f1" },
            { icon: Landmark, label: "Finance", color: "#8b5cf6" },
            { icon: Shield, label: "Team Setup", color: "#22c55e" },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              style={{
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                padding: "20px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <CheckCircle2 size={28} color={color} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <Btn
          onClick={() => (window.location.href = "/admin/dashboard")}
          variant="primary"
        >
          Go to Dashboard <ChevronRight size={16} />
        </Btn>
      </div>
    );
  }

  // ─── Main Wizard ──────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .onb-fade{animation:fadeIn 0.3s ease}
        input:focus,select:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.12)}
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", margin: 0 }}
        >
          Organization Setup
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
          Complete the three steps below to finish setting up{" "}
          <strong>{org?.name}</strong>.
        </p>

        {/* Progress bar */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {[1, 2, 3].map((n) => {
            const done =
              n === 1
                ? progress?.step1Completed
                : n === 2
                  ? progress?.step2Completed
                  : progress?.step3Completed;
            return (
              <React.Fragment key={n}>
                <div
                  style={{
                    height: 6,
                    flex: 1,
                    borderRadius: 4,
                    background: done ? "#6366f1" : "#e2e8f0",
                    transition: "background 0.4s ease",
                  }}
                />
              </React.Fragment>
            );
          })}
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#6366f1",
              whiteSpace: "nowrap",
            }}
          >
            {progress?.step3Completed
              ? 3
              : progress?.step2Completed
                ? 2
                : progress?.step1Completed
                  ? 1
                  : 0}{" "}
            / 3
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
            color: "#ef4444",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <AlertCircle size={16} />
          <span style={{ flex: 1 }}>{error}</span>
          <X
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() => setError(null)}
          />
        </div>
      )}

      {/* ──── STEP 1: Business Information ──────────────────────────────────── */}
      <StepCard
        number={1}
        title="Business Information"
        icon={Building2}
        status={
          progress?.step1Completed
            ? "done"
            : activeStep === 1
              ? "open"
              : "closed"
        }
        locked={false}
        onClick={() => setActiveStep(1)}
      >
        <div className="onb-fade">
          {/* Read-only chips from super admin */}
          <div
            style={{
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 24,
              marginTop: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#94a3b8",
                marginBottom: 10,
                letterSpacing: "0.05em",
              }}
            >
              SET BY SUPER ADMIN
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Tag label={`Org: ${org?.name}`} color="#6366f1" />
              {(org?.frameworks || []).map((f) => (
                <Tag key={f} label={f} color="#8b5cf6" />
              ))}
              {org?.tprmEnabled && <Tag label="TPRM Enabled" color="#0ea5e9" />}
              <Tag
                label={`Max Users: ${seatLimit > 0 ? seatLimit : "Unlimited"}`}
                color="#f59e0b"
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 24px",
            }}
          >
            <Field
              label="Legal Entity Name"
              required
              hint="Exact name as registered with the government"
            >
              <Input
                value={biz.legalEntityName}
                onChange={(e) =>
                  setBiz({ ...biz, legalEntityName: e.target.value })
                }
                placeholder="Acme Technologies Pvt. Ltd."
                prefix={<Building2 size={14} />}
              />
            </Field>

            <Field label="Industry / Sector" required>
              <Select
                value={biz.industry}
                onChange={(e) => setBiz({ ...biz, industry: e.target.value })}
                options={INDUSTRY_OPTIONS}
              />
            </Field>

            <Field
              label="Organization Website"
              hint="e.g. https://yourcompany.com"
            >
              <Input
                value={biz.website}
                onChange={(e) => setBiz({ ...biz, website: e.target.value })}
                placeholder="https://"
                prefix={<Globe size={14} />}
              />
            </Field>

            <Field label="Contact Phone">
              <Input
                value={biz.phone}
                onChange={(e) => setBiz({ ...biz, phone: e.target.value })}
                placeholder="+91 98765 43210"
                prefix={<Phone size={14} />}
              />
            </Field>

            <Field label="Total Employees" required>
              <Select
                value={biz.totalEmployees}
                onChange={(e) =>
                  setBiz({ ...biz, totalEmployees: e.target.value })
                }
                options={[
                  { value: "1-50", label: "1–50" },
                  { value: "51-200", label: "51–200" },
                  { value: "201-500", label: "201–500" },
                  { value: "501-2000", label: "501–2000" },
                  { value: "2001+", label: "2001+" },
                ]}
              />
            </Field>

            <Field label="Number of Office Locations" required>
              <Input
                type="number"
                value={biz.officeLocations}
                onChange={handleOfficeLocationsChange}
                placeholder="e.g. 3"
              />
            </Field>

            <Field label="Compliance Team Size">
              <Input
                type="number"
                value={biz.complianceTeamSize}
                onChange={(e) => {
                  const val = e.target.value;
                  if (seatLimit > 0 && parseInt(val, 10) > seatLimit) {
                    setTeamSizeError(
                      `Under your subscription plan, only ${seatLimit} users are allowed. Please upgrade your plan or purchase additional user seats to add more.`,
                    );
                  } else {
                    setTeamSizeError(null);
                    setBiz({ ...biz, complianceTeamSize: val });
                  }
                }}
                placeholder="e.g. 5"
              />
              {teamSizeError && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: 12,
                    marginTop: 6,
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle
                    size={14}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: 4,
                    }}
                  />
                  <span style={{ verticalAlign: "middle" }}>
                    {teamSizeError}
                  </span>
                </div>
              )}
            </Field>

            <Field
              label="Email Domain"
              hint="Primary domain for your organization"
            >
              <Input
                value={biz.domain}
                onChange={(e) => setBiz({ ...biz, domain: e.target.value })}
                placeholder="yourdomain.com"
              />
            </Field>
          </div>

          {/* Dynamic office addresses — one input per office location */}
          <div
            style={{
              borderTop: "1.5px solid #f1f5f9",
              paddingTop: 20,
              marginTop: 4,
              marginBottom: 8,
              fontWeight: 700,
              fontSize: 14,
              color: "#475569",
            }}
          >
            Office Addresses
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
            One address per office location entered above.
          </div>
          {officeAddresses.map((addr, i) => (
            <Field key={i} label={`Office ${i + 1} Address`} required>
              <Input
                value={addr}
                onChange={(e) => updateOfficeAddress(i, e.target.value)}
                placeholder="Street, City, State, Country"
                prefix={<MapPin size={14} />}
              />
            </Field>
          ))}

          <div
            style={{
              borderTop: "1.5px solid #f1f5f9",
              paddingTop: 20,
              marginTop: 4,
              marginBottom: 8,
              fontWeight: 700,
              fontSize: 14,
              color: "#475569",
            }}
          >
            Primary Compliance Contact
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0 24px",
            }}
          >
            <Field label="Full Name" required hint="Auto-filled from your login — editable">
              <Input
                value={biz.primaryContactName}
                onChange={(e) =>
                  setBiz({ ...biz, primaryContactName: e.target.value })
                }
                placeholder="Jane Smith"
                prefix={<User size={14} />}
              />
            </Field>
            <Field label="Email" required hint="Auto-filled from your login — editable">
              <Input
                type="email"
                value={biz.primaryContactEmail}
                onChange={(e) =>
                  setBiz({ ...biz, primaryContactEmail: e.target.value })
                }
                placeholder="jane@company.com"
                prefix={<Mail size={14} />}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={biz.primaryContactPhone}
                onChange={(e) =>
                  setBiz({ ...biz, primaryContactPhone: e.target.value })
                }
                placeholder="+91 …"
                prefix={<Phone size={14} />}
              />
            </Field>
          </div>

          <div style={{ marginTop: 12 }}>
            <Btn onClick={saveStep1} loading={step1Saving} variant="primary">
              Save & Continue <ChevronRight size={16} />
            </Btn>
          </div>
        </div>
      </StepCard>

      {/* ──── STEP 2: Finance ───────────────────────────────────────────────── */}
      <StepCard
        number={2}
        title="Finance"
        icon={Landmark}
        status={
          progress?.step2Completed
            ? "done"
            : !progress?.step1Completed
              ? "locked"
              : activeStep === 2
                ? "open"
                : "closed"
        }
        locked={!progress?.step1Completed}
        onClick={() => progress?.step1Completed && setActiveStep(2)}
      >
        <div className="onb-fade">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              background: "#eef2ff",
              border: "1.5px solid #c7d2fe",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 24, flexShrink: 0 }}>🏦</div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#3730a3",
                  marginBottom: 4,
                }}
              >
                Statutory & billing details
              </div>
              <div style={{ fontSize: 13, color: "#4338ca", lineHeight: 1.6 }}>
                We use this to generate compliant invoices and verify your
                organization. This information is kept confidential and is
                never shared outside billing and compliance workflows.
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 24px",
            }}
          >
            <Field label="Official Email ID" required>
              <Input
                type="email"
                value={finance.officialEmail}
                onChange={(e) =>
                  setFinance({ ...finance, officialEmail: e.target.value })
                }
                placeholder="finance@company.com"
                prefix={<Mail size={14} />}
              />
            </Field>

            <Field label="GST Number" required hint="15-character GSTIN">
              <Input
                value={finance.gstNumber}
                onChange={(e) =>
                  setFinance({
                    ...finance,
                    gstNumber: e.target.value.toUpperCase(),
                  })
                }
                placeholder="22AAAAA0000A1Z5"
              />
            </Field>

            <Field
              label="Registered Office Address"
              required
              hint="Address as per your GST/CIN registration"
            >
              <Input
                value={finance.registeredOfficeAddress}
                onChange={(e) =>
                  setFinance({
                    ...finance,
                    registeredOfficeAddress: e.target.value,
                  })
                }
                placeholder="Street, City, State, PIN, Country"
                prefix={<MapPin size={14} />}
              />
            </Field>

            <Field label="CIN Number" required hint="Corporate Identity Number">
              <Input
                value={finance.cinNumber}
                onChange={(e) =>
                  setFinance({
                    ...finance,
                    cinNumber: e.target.value.toUpperCase(),
                  })
                }
                placeholder="U72900KA2020PTC012345"
              />
            </Field>
          </div>

          <Field
            label="Supporting Document"
            required
            hint="Upload your GST certificate or CIN certificate"
          >
            <FileDropInput
              file={financeDoc}
              existingName={progress?.financeInfo?.documentFileName}
              onChange={(e) => setFinanceDoc(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png"
              label="finance document"
            />
          </Field>

          <div style={{ marginTop: 16 }}>
            <Btn onClick={saveStep2} loading={step2Saving} variant="primary">
              Save & Continue <ChevronRight size={16} />
            </Btn>
          </div>
        </div>
      </StepCard>

      {/* ──── STEP 3: Team Setup (departments + users) ───────────────────────── */}
      <StepCard
        number={3}
        title="Team Setup"
        icon={Shield}
        status={
          progress?.step3Completed
            ? "done"
            : !progress?.step2Completed
              ? "locked"
              : activeStep === 3
                ? "open"
                : "closed"
        }
        locked={!progress?.step2Completed}
        onClick={() => progress?.step2Completed && setActiveStep(3)}
      >
        <div className="onb-fade">
          {/* ── Departments section ── */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 12,
              padding: 20,
              marginBottom: 28,
              marginTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Briefcase size={16} color="#6366f1" />
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
                Departments
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                — create departments first before adding users
              </span>
            </div>

            {/* Existing departments */}
            {departments.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {departments.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#fff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 20,
                      padding: "5px 12px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#475569",
                    }}
                  >
                    {d.name}
                    <X
                      size={12}
                      style={{ cursor: "pointer", color: "#94a3b8" }}
                      onClick={() => deleteDepartment(d.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {addingDept ? (
              <div
                style={{
                  background: "#fff",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {lastCreatedDept ? (
                  <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <div
                      style={{
                        color: "#10b981",
                        fontWeight: 600,
                        marginBottom: "16px",
                      }}
                    >
                      ✓ Your department "{lastCreatedDept}" is created.
                    </div>
                    <Btn
                      onClick={() => setLastCreatedDept(null)}
                      variant="secondary"
                    >
                      <Plus size={14} /> Add more departments
                    </Btn>
                  </div>
                ) : (
                  <CreateDept
                    embedded={true}
                    onSuccess={(deptName) => {
                      setLastCreatedDept(deptName);
                      fetchDepartments();
                    }}
                    onCancel={() => {
                      setAddingDept(false);
                      setLastCreatedDept(null);
                    }}
                  />
                )}
              </div>
            ) : (
              <Btn onClick={() => setAddingDept(true)} variant="secondary">
                <Plus size={14} /> Add Department
              </Btn>
            )}
          </div>

          {/* ── User creation section ── */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Users size={16} color="#6366f1" />
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
                Add Team Members
              </span>
              <Tag
                label={
                  seatLimit > 0
                    ? `${users.length} / ${seatLimit} seats used`
                    : "Unlimited seats"
                }
                color={
                  seatLimit > 0 && users.length >= seatLimit
                    ? "#ef4444"
                    : "#f59e0b"
                }
              />
            </div>

            {/* User form */}
            {departments.length === 0 ? (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: 12,
                  padding: "32px 20px",
                  marginBottom: 16,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Briefcase size={32} color="#94a3b8" />
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#1e293b",
                    marginBottom: 4,
                  }}
                >
                  Department Required
                </div>
                <div style={{ fontSize: 13, maxWidth: 400, margin: "0 auto" }}>
                  Please create at least one department above before you can
                  start adding team members to your organization.
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0 24px",
                  }}
                >
                  <Field label="Full Name" required>
                    <Input
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="John Doe"
                      prefix={<User size={14} />}
                    />
                  </Field>
                  <Field label="Email" required>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="john@company.com"
                      prefix={<Mail size={14} />}
                    />
                  </Field>
                  <Field label="Role" required>
                    <Select
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                      options={ROLE_OPTIONS}
                    />
                  </Field>
                  <Field label="Department">
                    <Select
                      value={newUser.department}
                      onChange={(e) =>
                        setNewUser({ ...newUser, department: e.target.value })
                      }
                      options={departments.map((d) => ({
                        value: d.id,
                        label: d.name,
                      }))}
                    />
                  </Field>
                  <Field label="Temporary Password" required>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="Min 8 characters"
                    />
                  </Field>
                </div>
                {lastCreatedUser ? (
                  <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <div
                      style={{
                        color: "#10b981",
                        fontWeight: 600,
                        marginBottom: "16px",
                      }}
                    >
                      ✓ User "{lastCreatedUser}" is created.
                    </div>
                    <Btn
                      onClick={() => setLastCreatedUser(null)}
                      variant="secondary"
                    >
                      <Plus size={14} /> Add more user
                    </Btn>
                  </div>
                ) : (
                  <Btn
                    onClick={createUser}
                    loading={userSaving}
                    variant="secondary"
                  >
                    <Plus size={14} /> Create User
                  </Btn>
                )}
              </div>
            )}

            {/* Users added so far */}
            {users.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#94a3b8",
                    marginBottom: 10,
                  }}
                >
                  USERS ADDED THIS SESSION
                </div>
                {users.map((u) => (
                  <div
                    key={u.email}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      background: "#fff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "#eef2ff",
                        color: "#6366f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {u.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#1e293b",
                        }}
                      >
                        {u.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {u.email}
                      </div>
                    </div>
                    <Tag
                      label={(Array.isArray(u.role) ? u.role[0] : u.role)?.replace(
                        /_/g,
                        " ",
                      )}
                      color="#6366f1"
                    />
                    <Trash2
                      size={14}
                      color="#ef4444"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeUser(u.email)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <Btn
              onClick={saveStep3}
              loading={step3Saving}
              variant="success"
              disabled={departments.length === 0}
              title={
                departments.length === 0
                  ? "Create at least one department to continue"
                  : ""
              }
            >
              Complete Setup <CheckCircle2 size={16} />
            </Btn>
            <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 12 }}>
              You can add more users later from the Users section.
            </span>
          </div>
        </div>
      </StepCard>
    </div>
  );
}