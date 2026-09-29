// //cf-tool-frontend-main\src\modules\admin\components\Users\CreateUser.jsx

// "use client";

// import React, { useState, useEffect } from "react";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";
// import api from "../../api/adminAxios";
// import { useRouter } from "next/navigation";

// // MUI Imports
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Paper,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   OutlinedInput,
//   CircularProgress,
//   Stack,
//   Alert,
//   Chip,
//   InputAdornment,
//   IconButton,
//   Checkbox,
//   ListItemText,
// } from "@mui/material";

// // Icons
// import SaveIcon from "@mui/icons-material/Save";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import LockIcon from "@mui/icons-material/Lock";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";

// import { useEffectiveOrg } from "../../../../hooks/useEffectiveOrg";
// import useModuleEntitlements from "../../hooks/useModuleEntitlements";
// const TPRM_VENDORS_URL =
//   "https://api.calvant.com/tprm-service/api/tprm/vendors";

// export default function UserForm({ userToEdit = null, onSuccess }) {
//   const { isPartnerRoot, isOrgManager, effectiveOrgId, selectedChildOrg } =
//     useEffectiveOrg();

//   // ── Seat cap (fulfilment) — same idea as the integration slot cap:
//   // block creating a NEW user once seatsUsed >= purchased seats
//   // (adminUserCount + normalUserCount). Editing an existing user, and
//   // super_admin (platform admin, not org-scoped), are never blocked.
//   const {
//     loading: seatLoading,
//     seatLimit,
//     seatsUsed,
//   } = useModuleEntitlements();
//   const navigate = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [organizations, setOrganizations] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [vendorMap, setVendorMap] = useState({}); // id → displayName
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // Decode JWT
//   const token =
//     sessionStorage.getItem("token") || localStorage.getItem("token");
//   const decoded = token ? jwtDecode(token) : null;
//   const myObject = JSON.parse(
//     sessionStorage.getItem("user") || localStorage.getItem("myObject") || "{}",
//   );

//   const loggedInRole = Array.isArray(decoded?.role)
//     ? decoded.role[0]
//     : decoded?.role;

//   const userOrg = myObject?.organization || decoded?.organization;

//   // Only gate NEW user creation, never edits, never super_admin (not org-scoped).
//   const atSeatCap =
//     !userToEdit &&
//     loggedInRole !== "super_admin" &&
//     !seatLoading &&
//     seatLimit > 0 &&
//     seatsUsed >= seatLimit;
//   // Role options
//   // replace the entire roles block:
//   const roles =
//     loggedInRole === "super_admin"
//       ? ["root"]
//       : isPartnerRoot
//         ? [
//             "root",
//             "steering_committee_member",
//             "risk_owner",
//             "risk_manager",
//             "process_owner",
//             "process_manager",
//             "auditor",
//             "audit_manager",
//             "user",
//             "dpo",
//             "ciso",
//             "aio",
//           ]
//         : [
//             "steering_committee_member",
//             "risk_owner",
//             "risk_manager",
//             "process_owner",
//             "process_manager",
//             "auditor",
//             "audit_manager",
//             "user",
//             "dpo",
//             "ciso",
//             "aio",
//           ];

//   // Display-only labels — underlying values sent to the backend stay
//   // unchanged (lowercase snake_case).
//   const ROLE_LABELS = {
//     ciso: "CISO",
//     aio: "AI Officer",
//     dpo: "DPO",
//   };
//   const formatRoleLabel = (role) =>
//     ROLE_LABELS[role] ||
//     role
//       .split("_")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: [],
//     department: [],
//     organization: "",
//     modules: [],
//     vendors: [],
//   });
//   const [lastCreatedUser, setLastCreatedUser] = useState(null);

//   const normalizeArray = (data, keepEmpty = false) => {
//     if (!data) return [];
//     if (Array.isArray(data)) {
//       if (keepEmpty) return data; // Keep empty strings when needed
//       return data.filter(Boolean);
//     }
//     if (typeof data === "string") {
//       if (data.trim() === "") return [];
//       return data
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);
//     }
//     return [];
//   };

//   // ── Derived booleans ──────────────────────────────────────────────────────
//   const isUserRole = formData.role.includes("user");
//   const isSteeringRole = formData.role.includes("steering_committee_member"); // ✅ Added Support

//   const isTprmSelected = formData.modules.includes("tprm");
//   const isDeptSelected = formData.department.length > 0;
//   // Check if any of the special roles (dpo, ciso, aio) are selected
//   const hasSpecialRole = formData.role.some((role) =>
//     ["dpo", "ciso", "aio"].includes(role),
//   );

//   // Show department when:
//   // 1. Special roles are selected (dpo, ciso, aio), OR
//   // 2. User or Steering role is selected but tprm is NOT selected, OR
//   // 3. Non-user/non-steering roles are selected (but not special roles when they're the only selection)
//   const isCreatingRoot = formData.role.includes("root");

//   const selectedOrgIsChildOrg =
//     isPartnerRoot &&
//     formData.organization !== "" &&
//     formData.organization !== userOrg;
//   const showDepartment =
//     loggedInRole === "root" &&
//     !isCreatingRoot &&
//     (hasSpecialRole ||
//       !(isUserRole || isSteeringRole) ||
//       ((isUserRole || isSteeringRole) && !isTprmSelected));

//   const showVendors =
//     loggedInRole === "root" &&
//     !isCreatingRoot &&
//     (isUserRole || isSteeringRole) &&
//     isTprmSelected;

//   // isAuditor auto-derived from role — not shown in UI
//   const isAuditorAuto =
//     formData.role.includes("auditor") ||
//     formData.role.includes("audit_manager");

//   // ── Fetch Departments (root only) ─────────────────────────────────────────
//   useEffect(() => {
//     const fetchDepartments = async () => {
//       if (loggedInRole === "root") {
//         try {
//           // use selected org if partner root picked one, otherwise own org
//           const ownOrg = userOrg;
//           const orgId =
//             isPartnerRoot && formData.organization
//               ? formData.organization
//               : ownOrg;

//           const res = await api.get(
//             "https://api.calvant.com/user-service/api/departments",
//             {
//               params: { organization: orgId },
//             },
//           );
//           const all = Array.isArray(res.data) ? res.data : [];
//           setDepartments(all); // backend already filters by org
//         } catch (err) {
//           setError("Failed to load departments");
//         }
//       }
//     };
//     fetchDepartments();
//   }, [loggedInRole, userOrg, formData.organization]);

//   // ── Fetch Organizations (super_admin only) ────────────────────────────────

//   useEffect(() => {
//     const fetchOrganizations = async () => {
//       if (loggedInRole === "super_admin") {
//         const res = await api.get(
//           "https://api.calvant.com/user-service/api/organizations",
//         );
//         setOrganizations(Array.isArray(res.data) ? res.data : []);
//       } else if (isPartnerRoot) {
//         // partner root sees only their child orgs
//         const res = await api.get(
//           "https://api.calvant.com/user-service/api/organizations/children",
//         );
//         setOrganizations(Array.isArray(res.data) ? res.data : []);
//       }
//     };
//     fetchOrganizations();
//   }, [loggedInRole, isPartnerRoot]);
//   // ── Fetch Vendors when tprm module is selected ────────────────────────────
//   useEffect(() => {
//     if (!isTprmSelected) {
//       setVendors([]);
//       return;
//     }
//     const fetchVendors = async () => {
//       try {
//         const myObj = JSON.parse(localStorage.getItem("myObject") || "{}");
//         const orgId = myObj?.organization || userOrg;
//         const res = await axios.get(TPRM_VENDORS_URL, {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { organization: orgId },
//         });
//         const data = Array.isArray(res.data)
//           ? res.data
//           : (res.data?.content ?? []);
//         setVendors(data);
//         // Build id → name map so chips always show names, not raw IDs
//         const map = {};
//         data.forEach((v) => {
//           // API may return id, _id, or vendorId — try all
//           const id = v.id ?? v._id ?? v.vendorId;
//           if (id) map[String(id)] = v.vendorName || v.name || String(id);
//         });
//         setVendorMap((prev) => ({ ...prev, ...map }));
//       } catch (err) {
//         console.error("Vendor fetch failed:", err.message);
//       }
//     };
//     fetchVendors();
//   }, [isTprmSelected]);

//   // ── Prefill in edit mode ───────────────────────────────────────────────────
//   useEffect(() => {
//     if (userToEdit) {
//       setFormData({
//         name: userToEdit.name || "",
//         email: userToEdit.email || "",
//         password: "",
//         role: normalizeArray(userToEdit.role),
//         department: normalizeArray(userToEdit.department),
//         organization: userToEdit.organization || "",
//         modules: normalizeArray(userToEdit.modules),
//         vendors: normalizeArray(userToEdit.vendors),
//       });
//     }
//   }, [userToEdit]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleMultiChange = (e) => {
//     const { name, value } = e.target;
//     const newValue = Array.isArray(value) ? value : normalizeArray(value);

//     if (name === "department") {
//       const isRiskOwner = formData.role.includes("risk_owner");
//       if (isRiskOwner && newValue.length > 1) {
//         setFormData((prev) => ({
//           ...prev,
//           [name]: [newValue[newValue.length - 1]],
//         }));
//         return;
//       }
//     }

//     setFormData((prev) => {
//       let finalNewValue = [...newValue];

//       if (name === "role") {
//         // Multi-roles are supported cumulatively (e.g. Risk Owner + User)
//       }

//       // If modules change and tprm is removed, clear vendors
//       if (name === "modules" && !finalNewValue.includes("tprm")) {
//         return { ...prev, [name]: finalNewValue, vendors: [] };
//       }

//       // If modules change and tprm is added, clear department (backend expects empty array, not [""])
//       if (name === "modules" && finalNewValue.includes("tprm")) {
//         return { ...prev, [name]: finalNewValue, department: [] };
//       }

//       return { ...prev, [name]: finalNewValue };
//     });
//   };

//   const handleChipDelete = (fieldName, valueToRemove) => {
//     setFormData((prev) => {
//       const updated = {
//         ...prev,
//         [fieldName]: prev[fieldName].filter((v) => v !== valueToRemove),
//       };
//       if (
//         fieldName === "role" &&
//         (valueToRemove === "user" ||
//           valueToRemove === "steering_committee_member")
//       ) {
//         updated.modules = [];
//         updated.vendors = [];
//       }
//       if (fieldName === "modules" && valueToRemove === "tprm") {
//         updated.vendors = [];
//       }
//       return updated;
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (atSeatCap) {
//       setError(
//         "You've used all your user seats. Upgrade your plan under Manage Subscription to add more.",
//       );
//       return;
//     }
//     setLoading(true);
//     setError("");

//     try {
//       const rolesArr = normalizeArray(formData.role);
//       const vendorsArr = normalizeArray(formData.vendors);

//       const payload = {
//         name: formData.name,
//         email: formData.email.toLowerCase(),
//         role: rolesArr,
//         department:
//           loggedInRole === "super_admin"
//             ? []
//             : isTprmSelected
//               ? []
//               : normalizeArray(formData.department),
//         organization:
//           loggedInRole === "super_admin"
//             ? formData.organization
//             : isPartnerRoot
//               ? formData.organization || userOrg // selected child org OR own org
//               : isTprmSelected && vendorsArr.length > 0
//                 ? vendorsArr[0]
//                 : userOrg,
//         isAuditor:
//           rolesArr.includes("auditor") || rolesArr.includes("audit_manager"),
//         modules:
//           rolesArr.includes("user") ||
//           rolesArr.includes("steering_committee_member")
//             ? normalizeArray(formData.modules)
//             : [],
//         vendors: isTprmSelected ? vendorsArr : [],
//       };

//       // Only send a password on edit (admin resetting an existing user's
//       // password) and only when they actually typed a new one. On create,
//       // password is never sent — backend ignores/auto-generates it anyway.
//       if (userToEdit && formData.password) {
//         payload.password = formData.password;
//       }

//       console.log("payload organization:", payload.organization);
//       console.log("dept being sent:", normalizeArray(formData.department));

//       if (userToEdit) {
//         await api.post("/users/update", { ...payload, id: userToEdit.id });
//         alert("User updated successfully!");
//         onSuccess ? onSuccess() : navigate.back();
//       } else {
//         await api.post(
//           "https://api.calvant.com/user-service/api/users/register",
//           payload,
//         );
//         setLastCreatedUser(formData.name);
//         setFormData({
//           name: "",
//           email: "",
//           password: "",
//           role: [],
//           department: [],
//           organization: "",
//           modules: [],
//           vendors: [],
//         });
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.error ||
//           err.response?.data ||
//           "Failed to save user",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDeptLabel = (id) => {
//     const dept = departments.find((d) => d.id === id);
//     return dept ? dept.name : id;
//   };

//   const getVendorLabel = (id) =>
//     // Check vendorMap first (persists even after vendors list clears)
//     vendorMap[String(id)] || id;

//   return (
//     <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
//       <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: "100%" }}>
//         <Stack direction="row" spacing={1} mb={3}>
//           <Button
//             startIcon={<ArrowBackIcon />}
//             onClick={() => navigate.push("/admin/users")}
//           >
//             List
//           </Button>
//           <Typography
//             variant="h5"
//             sx={{ flexGrow: 1, textAlign: "center", pr: 8 }}
//           >
//             {userToEdit ? "Edit User" : "Create User"}
//           </Typography>
//         </Stack>

//         {!userToEdit &&
//           loggedInRole !== "super_admin" &&
//           !seatLoading &&
//           seatLimit > 0 && (
//             <Alert
//               severity={atSeatCap ? "warning" : "info"}
//               icon={atSeatCap ? <LockIcon fontSize="inherit" /> : undefined}
//               sx={{ mb: 1 }}
//             >
//               {atSeatCap
//                 ? `You've used all ${seatLimit} of your user seats (${seatsUsed}/${seatLimit}). Upgrade your plan under Manage Subscription to add more.`
//                 : `User seats: ${seatsUsed} of ${seatLimit} used (${seatLimit - seatsUsed} remaining).`}
//             </Alert>
//           )}

//         {error && (
//           <Alert severity="error" sx={{ mb: 1 }}>
//             {error}
//           </Alert>
//         )}

//         <form onSubmit={handleSubmit}>
//           <Stack spacing={2}>
//             {/* Basic Info */}
//             <TextField
//               label="Full Name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//             <TextField
//               label="Email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//             {/* Password field only applies to editing an existing user
//                 (admin resetting their password via /users/update).
//                 New users no longer take a password here — the backend
//                 auto-generates one and emails it with a forced first-login
//                 change, so there's nothing for root to type on create. */}
//             {userToEdit && (
//               <TextField
//                 label="New Password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Leave blank to keep current password"
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton
//                         aria-label="toggle password visibility"
//                         onClick={() => setShowPassword(!showPassword)}
//                         edge="end"
//                       >
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//             )}

//             {/* Roles */}
//             <FormControl fullWidth>
//               <InputLabel>Roles</InputLabel>
//               <Select
//                 multiple
//                 name="role"
//                 value={formData.role}
//                 onChange={handleMultiChange}
//                 input={<OutlinedInput label="Roles" />}
//                 renderValue={(selected) => (
//                   <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                     {selected.map((val) => (
//                       <Chip
//                         key={val}
//                         label={formatRoleLabel(val)}
//                         size="small"
//                         onDelete={() => handleChipDelete("role", val)}
//                         onMouseDown={(e) => e.stopPropagation()}
//                       />
//                     ))}
//                   </Box>
//                 )}
//               >
//                 {roles
//                   .filter((r) => {
//                     if (r === "user" && formData.role.some((s) => s !== "user"))
//                       return false;
//                     return true;
//                   })
//                   .map((r) => (
//                     <MenuItem key={r} value={r}>
//                       <Checkbox
//                         checked={formData.role.includes(r)}
//                         size="small"
//                         sx={{ p: 0.5, mr: 1 }}
//                       />
//                       <ListItemText primary={formatRoleLabel(r)} />
//                     </MenuItem>
//                   ))}
//               </Select>
//             </FormControl>

//             {/* Modules — only for role=user or steering_committee_member (root only), shown BEFORE department */}
//             {loggedInRole === "root" &&
//               !isCreatingRoot &&
//               (isUserRole || isSteeringRole) && (
//                 <FormControl fullWidth>
//                   <InputLabel>Modules</InputLabel>
//                   <Select
//                     multiple
//                     name="modules"
//                     value={formData.modules}
//                     onChange={handleMultiChange}
//                     input={<OutlinedInput label="Modules" />}
//                     renderValue={(selected) => (
//                       <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                         {selected.map((val) => (
//                           <Chip
//                             key={val}
//                             label={val}
//                             size="small"
//                             onDelete={() => handleChipDelete("modules", val)}
//                             onMouseDown={(e) => e.stopPropagation()}
//                           />
//                         ))}
//                       </Box>
//                     )}
//                   >
//                     {["audit", "compliance", "policies", "risk", "tprm"].map(
//                       (m) => (
//                         <MenuItem key={m} value={m}>
//                           {m}
//                         </MenuItem>
//                       ),
//                     )}
//                   </Select>
//                 </FormControl>
//               )}

//             {/* Vendors dropdown — only when tprm module is selected */}
//             {showVendors && (
//               <FormControl fullWidth>
//                 <InputLabel>Vendors (TPRM)</InputLabel>
//                 <Select
//                   multiple
//                   name="vendors"
//                   value={formData.vendors}
//                   onChange={handleMultiChange}
//                   input={<OutlinedInput label="Vendors (TPRM)" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                       {selected.map((val) => (
//                         <Chip
//                           key={val}
//                           label={getVendorLabel(val)}
//                           size="small"
//                           onDelete={() => handleChipDelete("vendors", val)}
//                           onMouseDown={(e) => e.stopPropagation()}
//                         />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   {vendors.length === 0 ? (
//                     <MenuItem disabled>No vendors found</MenuItem>
//                   ) : (
//                     vendors.map((v) => {
//                       const id = v.id || v._id;
//                       return (
//                         <MenuItem key={id} value={id}>
//                           {v.vendorName || v.name}
//                         </MenuItem>
//                       );
//                     })
//                   )}
//                 </Select>
//               </FormControl>
//             )}

//             {/* Organization (super_admin only) */}
//             {(loggedInRole === "super_admin" || isPartnerRoot) && (
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//                 <FormControl fullWidth>
//                   <InputLabel>Organization (optional)</InputLabel>
//                   <Select
//                     name="organization"
//                     value={formData.organization}
//                     onChange={handleChange}
//                     input={<OutlinedInput label="Organization (optional)" />}
//                     // remove required
//                   >
//                     <MenuItem value="">— My Organization (default) —</MenuItem>
//                     {organizations.map((org) => (
//                       <MenuItem
//                         key={org.id || org._id}
//                         value={org.id || org._id}
//                       >
//                         {org.name}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             )}

//             {/* Department — shown for special roles (dpo, ciso, aio) and other conditions */}
//             {showDepartment && (
//               <FormControl fullWidth>
//                 <InputLabel>Department</InputLabel>
//                 <Select
//                   multiple
//                   name="department"
//                   value={formData.department}
//                   onChange={handleMultiChange}
//                   input={<OutlinedInput label="Department" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                       {selected.map((val) => (
//                         <Chip
//                           key={val}
//                           label={getDeptLabel(val)}
//                           size="small"
//                           onDelete={() => handleChipDelete("department", val)}
//                           onMouseDown={(e) => e.stopPropagation()}
//                         />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   {departments.length === 0 ? (
//                     <MenuItem disabled>No departments available</MenuItem>
//                   ) : (
//                     departments.map((d) => (
//                       <MenuItem key={d.id} value={d.id}>
//                         {d.name}
//                       </MenuItem>
//                     ))
//                   )}
//                 </Select>
//               </FormControl>
//             )}
//             {lastCreatedUser && !userToEdit && (
//               <div
//                 style={{
//                   padding: "12px",
//                   background: "#ecfdf5",
//                   color: "#10b981",
//                   borderRadius: "8px",
//                   textAlign: "center",
//                   fontWeight: 600,
//                 }}
//               >
//                 ✓ User "{lastCreatedUser}" was created successfully. They'll receive an email with their login details.
//               </div>
//             )}

//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: "12px",
//                 marginTop: "16px",
//               }}
//             >
//               <Button variant="outlined" onClick={() => navigate.back()}>
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 variant="contained"
//                 disabled={loading || atSeatCap}
//                 startIcon={
//                   loading ? (
//                     <CircularProgress size={20} />
//                   ) : atSeatCap ? (
//                     <LockIcon />
//                   ) : (
//                     <SaveIcon />
//                   )
//                 }
//               >
//                 {atSeatCap
//                   ? "Upgrade to add more seats"
//                   : userToEdit
//                     ? "Update User"
//                     : "Create User"}
//               </Button>
//             </div>
//           </Stack>
//         </form>
//       </Paper>
//     </Box>
//   );
// }


//cf-tool-frontend-main\src\modules\admin\components\Users\CreateUser.jsx

"use client";

import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import api from "../../api/adminAxios";
import { useRouter } from "next/navigation";

// MUI Imports
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  CircularProgress,
  Stack,
  Alert,
  Chip,
  InputAdornment,
  IconButton,
  Checkbox,
  ListItemText,
} from "@mui/material";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useEffectiveOrg } from "../../../../hooks/useEffectiveOrg";
import useModuleEntitlements from "../../hooks/useModuleEntitlements";
const TPRM_VENDORS_URL =
  "https://api.calvant.com/tprm-service/api/tprm/vendors";

// ── Modern styling tokens — same light-theme system as the Admin Dashboard:
// soft ambient shadows at rest, gradient accents, rounded surfaces. No dark
// colors anywhere.
const FIELD_RADIUS = 12;
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: `${FIELD_RADIUS}px`,
    background: "#fff",
    transition: "box-shadow .18s ease, border-color .18s ease",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#93b4fb" },
    "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: "1.5px" },
    "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(37,99,235,0.12)" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
};

const primaryButtonSx = {
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 700,
  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
  boxShadow: "0 6px 16px -4px rgba(37,99,235,0.45)",
  px: 2.5,
  py: 1,
  transition: "box-shadow .18s ease, transform .18s ease, filter .18s ease",
  "&:hover": {
    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
    boxShadow: "0 8px 20px -4px rgba(37,99,235,0.55)",
    transform: "translateY(-1px)",
    filter: "brightness(1.05)",
  },
  "&.Mui-disabled": {
    background: "#cbd5e1",
    color: "#fff",
    boxShadow: "none",
  },
};

const outlinedButtonSx = {
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 600,
  borderColor: "#e2e8f0",
  color: "#4a5568",
  transition: "background .15s ease, border-color .15s ease, transform .15s ease",
  "&:hover": {
    borderColor: "#c7d7fe",
    background: "#f5f8ff",
    transform: "translateY(-1px)",
  },
};

export default function UserForm({ userToEdit = null, onSuccess }) {
  const { isPartnerRoot, isOrgManager, effectiveOrgId, selectedChildOrg } =
    useEffectiveOrg();

  // ── Seat cap (fulfilment) — same idea as the integration slot cap:
  // block creating a NEW user once seatsUsed >= purchased seats
  // (adminUserCount + normalUserCount). Editing an existing user, and
  // super_admin (platform admin, not org-scoped), are never blocked.
  const {
    loading: seatLoading,
    seatLimit,
    seatsUsed,
  } = useModuleEntitlements();
  const navigate = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorMap, setVendorMap] = useState({}); // id → displayName
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Decode JWT
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const myObject = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("myObject") || "{}",
  );

  const loggedInRole = Array.isArray(decoded?.role)
    ? decoded.role[0]
    : decoded?.role;

  const userOrg = myObject?.organization || decoded?.organization;

  // Only gate NEW user creation, never edits, never super_admin (not org-scoped).
  const atSeatCap =
    !userToEdit &&
    loggedInRole !== "super_admin" &&
    !seatLoading &&
    seatLimit > 0 &&
    seatsUsed >= seatLimit;
  // Role options
  // replace the entire roles block:
  const roles =
    loggedInRole === "super_admin"
      ? ["root"]
      : isPartnerRoot
        ? [
            "root",
            "steering_committee_member",
            "risk_owner",
            "risk_manager",
            "process_owner",
            "process_manager",
            "auditor",
            "audit_manager",
            "user",
            "dpo",
            "ciso",
            "aio",
          ]
        : [
            "steering_committee_member",
            "risk_owner",
            "risk_manager",
            "process_owner",
            "process_manager",
            "auditor",
            "audit_manager",
            "user",
            "dpo",
            "ciso",
            "aio",
          ];

  // Display-only labels — underlying values sent to the backend stay
  // unchanged (lowercase snake_case).
  const ROLE_LABELS = {
    ciso: "CISO",
    aio: "AI Officer",
    dpo: "DPO",
  };
  const formatRoleLabel = (role) =>
    ROLE_LABELS[role] ||
    role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: [],
    department: [],
    organization: "",
    modules: [],
    vendors: [],
  });
  const [lastCreatedUser, setLastCreatedUser] = useState(null);

  const normalizeArray = (data, keepEmpty = false) => {
    if (!data) return [];
    if (Array.isArray(data)) {
      if (keepEmpty) return data; // Keep empty strings when needed
      return data.filter(Boolean);
    }
    if (typeof data === "string") {
      if (data.trim() === "") return [];
      return data
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  // ── Derived booleans ──────────────────────────────────────────────────────
  const isUserRole = formData.role.includes("user");
  const isSteeringRole = formData.role.includes("steering_committee_member"); // ✅ Added Support

  const isTprmSelected = formData.modules.includes("tprm");
  const isDeptSelected = formData.department.length > 0;
  // Check if any of the special roles (dpo, ciso, aio) are selected
  const hasSpecialRole = formData.role.some((role) =>
    ["dpo", "ciso", "aio"].includes(role),
  );

  // Show department when:
  // 1. Special roles are selected (dpo, ciso, aio), OR
  // 2. User or Steering role is selected but tprm is NOT selected, OR
  // 3. Non-user/non-steering roles are selected (but not special roles when they're the only selection)
  const isCreatingRoot = formData.role.includes("root");

  const selectedOrgIsChildOrg =
    isPartnerRoot &&
    formData.organization !== "" &&
    formData.organization !== userOrg;
  const showDepartment =
    loggedInRole === "root" &&
    !isCreatingRoot &&
    (hasSpecialRole ||
      !(isUserRole || isSteeringRole) ||
      ((isUserRole || isSteeringRole) && !isTprmSelected));

  const showVendors =
    loggedInRole === "root" &&
    !isCreatingRoot &&
    (isUserRole || isSteeringRole) &&
    isTprmSelected;

  // isAuditor auto-derived from role — not shown in UI
  const isAuditorAuto =
    formData.role.includes("auditor") ||
    formData.role.includes("audit_manager");

  // ── Fetch Departments (root only) ─────────────────────────────────────────
  useEffect(() => {
    const fetchDepartments = async () => {
      if (loggedInRole === "root") {
        try {
          // use selected org if partner root picked one, otherwise own org
          const ownOrg = userOrg;
          const orgId =
            isPartnerRoot && formData.organization
              ? formData.organization
              : ownOrg;

          const res = await api.get(
            "https://api.calvant.com/user-service/api/departments",
            {
              params: { organization: orgId },
            },
          );
          const all = Array.isArray(res.data) ? res.data : [];
          setDepartments(all); // backend already filters by org
        } catch (err) {
          setError("Failed to load departments");
        }
      }
    };
    fetchDepartments();
  }, [loggedInRole, userOrg, formData.organization]);

  // ── Fetch Organizations (super_admin only) ────────────────────────────────

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (loggedInRole === "super_admin") {
        const res = await api.get(
          "https://api.calvant.com/user-service/api/organizations",
        );
        setOrganizations(Array.isArray(res.data) ? res.data : []);
      } else if (isPartnerRoot) {
        // partner root sees only their child orgs
        const res = await api.get(
          "https://api.calvant.com/user-service/api/organizations/children",
        );
        setOrganizations(Array.isArray(res.data) ? res.data : []);
      }
    };
    fetchOrganizations();
  }, [loggedInRole, isPartnerRoot]);
  // ── Fetch Vendors when tprm module is selected ────────────────────────────
  useEffect(() => {
    if (!isTprmSelected) {
      setVendors([]);
      return;
    }
    const fetchVendors = async () => {
      try {
        const myObj = JSON.parse(localStorage.getItem("myObject") || "{}");
        const orgId = myObj?.organization || userOrg;
        const res = await axios.get(TPRM_VENDORS_URL, {
          headers: { Authorization: `Bearer ${token}` },
          params: { organization: orgId },
        });
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.content ?? []);
        setVendors(data);
        // Build id → name map so chips always show names, not raw IDs
        const map = {};
        data.forEach((v) => {
          // API may return id, _id, or vendorId — try all
          const id = v.id ?? v._id ?? v.vendorId;
          if (id) map[String(id)] = v.vendorName || v.name || String(id);
        });
        setVendorMap((prev) => ({ ...prev, ...map }));
      } catch (err) {
        console.error("Vendor fetch failed:", err.message);
      }
    };
    fetchVendors();
  }, [isTprmSelected]);

  // ── Prefill in edit mode ───────────────────────────────────────────────────
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || "",
        email: userToEdit.email || "",
        password: "",
        role: normalizeArray(userToEdit.role),
        department: normalizeArray(userToEdit.department),
        organization: userToEdit.organization || "",
        modules: normalizeArray(userToEdit.modules),
        vendors: normalizeArray(userToEdit.vendors),
      });
    }
  }, [userToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiChange = (e) => {
    const { name, value } = e.target;
    const newValue = Array.isArray(value) ? value : normalizeArray(value);

    if (name === "department") {
      const isRiskOwner = formData.role.includes("risk_owner");
      if (isRiskOwner && newValue.length > 1) {
        setFormData((prev) => ({
          ...prev,
          [name]: [newValue[newValue.length - 1]],
        }));
        return;
      }
    }

    setFormData((prev) => {
      let finalNewValue = [...newValue];

      if (name === "role") {
        // Multi-roles are supported cumulatively (e.g. Risk Owner + User)
      }

      // If modules change and tprm is removed, clear vendors
      if (name === "modules" && !finalNewValue.includes("tprm")) {
        return { ...prev, [name]: finalNewValue, vendors: [] };
      }

      // If modules change and tprm is added, clear department (backend expects empty array, not [""])
      if (name === "modules" && finalNewValue.includes("tprm")) {
        return { ...prev, [name]: finalNewValue, department: [] };
      }

      return { ...prev, [name]: finalNewValue };
    });
  };

  const handleChipDelete = (fieldName, valueToRemove) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [fieldName]: prev[fieldName].filter((v) => v !== valueToRemove),
      };
      if (
        fieldName === "role" &&
        (valueToRemove === "user" ||
          valueToRemove === "steering_committee_member")
      ) {
        updated.modules = [];
        updated.vendors = [];
      }
      if (fieldName === "modules" && valueToRemove === "tprm") {
        updated.vendors = [];
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (atSeatCap) {
      setError(
        "You've used all your user seats. Upgrade your plan under Manage Subscription to add more.",
      );
      return;
    }
    setLoading(true);
    setError("");

    try {
      const rolesArr = normalizeArray(formData.role);
      const vendorsArr = normalizeArray(formData.vendors);

      const payload = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        role: rolesArr,
        department:
          loggedInRole === "super_admin"
            ? []
            : isTprmSelected
              ? []
              : normalizeArray(formData.department),
        organization:
          loggedInRole === "super_admin"
            ? formData.organization
            : isPartnerRoot
              ? formData.organization || userOrg // selected child org OR own org
              : isTprmSelected && vendorsArr.length > 0
                ? vendorsArr[0]
                : userOrg,
        isAuditor:
          rolesArr.includes("auditor") || rolesArr.includes("audit_manager"),
        modules:
          rolesArr.includes("user") ||
          rolesArr.includes("steering_committee_member")
            ? normalizeArray(formData.modules)
            : [],
        vendors: isTprmSelected ? vendorsArr : [],
      };

      // Only send a password on edit (admin resetting an existing user's
      // password) and only when they actually typed a new one. On create,
      // password is never sent — backend ignores/auto-generates it anyway.
      if (userToEdit && formData.password) {
        payload.password = formData.password;
      }

      console.log("payload organization:", payload.organization);
      console.log("dept being sent:", normalizeArray(formData.department));

      if (userToEdit) {
        await api.post("/users/update", { ...payload, id: userToEdit.id });
        alert("User updated successfully!");
        onSuccess ? onSuccess() : navigate.back();
      } else {
        await api.post(
          "https://api.calvant.com/user-service/api/users/register",
          payload,
        );
        setLastCreatedUser(formData.name);
        setFormData({
          name: "",
          email: "",
          password: "",
          role: [],
          department: [],
          organization: "",
          modules: [],
          vendors: [],
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data ||
          "Failed to save user",
      );
    } finally {
      setLoading(false);
    }
  };

  const getDeptLabel = (id) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.name : id;
  };

  const getVendorLabel = (id) =>
    // Check vendorMap first (persists even after vendors list clears)
    vendorMap[String(id)] || id;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 15% 0%, #eef2ff 0%, #eef1f8 38%, #eef1f8 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 600,
          width: "100%",
          borderRadius: "18px",
          border: "1px solid #e8ebf1",
          boxShadow:
            "0 1px 2px rgba(15,23,42,0.04), 0 8px 20px -14px rgba(15,23,42,0.08)",
          alignSelf: "flex-start",
          mt: { xs: 1, sm: 3 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate.push("/admin/users")}
            sx={outlinedButtonSx}
            variant="outlined"
          >
            List
          </Button>
          <Box sx={{ flexGrow: 1, textAlign: "center", pr: 8 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.5px",
                background:
                  "linear-gradient(90deg, #1a2036 0%, #334066 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {userToEdit ? "Edit User" : "Create User"}
            </Typography>
          </Box>
        </Stack>

        {!userToEdit &&
          loggedInRole !== "super_admin" &&
          !seatLoading &&
          seatLimit > 0 && (
            <Alert
              severity={atSeatCap ? "warning" : "info"}
              icon={atSeatCap ? <LockIcon fontSize="inherit" /> : undefined}
              sx={{ mb: 1, borderRadius: "12px" }}
            >
              {atSeatCap
                ? `You've used all ${seatLimit} of your user seats (${seatsUsed}/${seatLimit}). Upgrade your plan under Manage Subscription to add more.`
                : `User seats: ${seatsUsed} of ${seatLimit} used (${seatLimit - seatsUsed} remaining).`}
            </Alert>
          )}

        {error && (
          <Alert severity="error" sx={{ mb: 1, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Basic Info */}
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={fieldSx}
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={fieldSx}
            />
            {/* Password field only applies to editing an existing user
                (admin resetting their password via /users/update).
                New users no longer take a password here — the backend
                auto-generates one and emails it with a forced first-login
                change, so there's nothing for root to type on create. */}
            {userToEdit && (
              <TextField
                label="New Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                sx={fieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Roles */}
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                name="role"
                value={formData.role}
                onChange={handleMultiChange}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((val) => (
                      <Chip
                        key={val}
                        label={formatRoleLabel(val)}
                        size="small"
                        onDelete={() => handleChipDelete("role", val)}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
              >
                {roles
                  .filter((r) => {
                    if (r === "user" && formData.role.some((s) => s !== "user"))
                      return false;
                    return true;
                  })
                  .map((r) => (
                    <MenuItem key={r} value={r}>
                      <Checkbox
                        checked={formData.role.includes(r)}
                        size="small"
                        sx={{ p: 0.5, mr: 1 }}
                      />
                      <ListItemText primary={formatRoleLabel(r)} />
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Modules — only for role=user or steering_committee_member (root only), shown BEFORE department */}
            {loggedInRole === "root" &&
              !isCreatingRoot &&
              (isUserRole || isSteeringRole) && (
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Modules</InputLabel>
                  <Select
                    multiple
                    name="modules"
                    value={formData.modules}
                    onChange={handleMultiChange}
                    input={<OutlinedInput label="Modules" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((val) => (
                          <Chip
                            key={val}
                            label={val}
                            size="small"
                            onDelete={() => handleChipDelete("modules", val)}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {["audit", "compliance", "policies", "risk", "tprm"].map(
                      (m) => (
                        <MenuItem key={m} value={m}>
                          {m}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              )}

            {/* Vendors dropdown — only when tprm module is selected */}
            {showVendors && (
              <FormControl fullWidth sx={fieldSx}>
                <InputLabel>Vendors (TPRM)</InputLabel>
                <Select
                  multiple
                  name="vendors"
                  value={formData.vendors}
                  onChange={handleMultiChange}
                  input={<OutlinedInput label="Vendors (TPRM)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((val) => (
                        <Chip
                          key={val}
                          label={getVendorLabel(val)}
                          size="small"
                          onDelete={() => handleChipDelete("vendors", val)}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {vendors.length === 0 ? (
                    <MenuItem disabled>No vendors found</MenuItem>
                  ) : (
                    vendors.map((v) => {
                      const id = v.id || v._id;
                      return (
                        <MenuItem key={id} value={id}>
                          {v.vendorName || v.name}
                        </MenuItem>
                      );
                    })
                  )}
                </Select>
              </FormControl>
            )}

            {/* Organization (super_admin only) */}
            {(loggedInRole === "super_admin" || isPartnerRoot) && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Organization (optional)</InputLabel>
                  <Select
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    input={<OutlinedInput label="Organization (optional)" />}
                    // remove required
                  >
                    <MenuItem value="">— My Organization (default) —</MenuItem>
                    {organizations.map((org) => (
                      <MenuItem
                        key={org.id || org._id}
                        value={org.id || org._id}
                      >
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Department — shown for special roles (dpo, ciso, aio) and other conditions */}
            {showDepartment && (
              <FormControl fullWidth sx={fieldSx}>
                <InputLabel>Department</InputLabel>
                <Select
                  multiple
                  name="department"
                  value={formData.department}
                  onChange={handleMultiChange}
                  input={<OutlinedInput label="Department" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((val) => (
                        <Chip
                          key={val}
                          label={getDeptLabel(val)}
                          size="small"
                          onDelete={() => handleChipDelete("department", val)}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {departments.length === 0 ? (
                    <MenuItem disabled>No departments available</MenuItem>
                  ) : (
                    departments.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}
            {lastCreatedUser && !userToEdit && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 16px",
                  background:
                    "linear-gradient(135deg, #e9fbf4 0%, #ecfdf5 100%)",
                  border: "1px solid #bbf0d9",
                  color: "#166534",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: 13.5,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#34d399,#059669)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    boxShadow: "0 3px 8px -2px rgba(5,150,105,0.5)",
                  }}
                >
                  ✓
                </span>
                User "{lastCreatedUser}" was created successfully. They'll
                receive an email with their login details.
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate.back()}
                sx={outlinedButtonSx}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || atSeatCap}
                sx={primaryButtonSx}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : atSeatCap ? (
                    <LockIcon />
                  ) : (
                    <SaveIcon />
                  )
                }
              >
                {atSeatCap
                  ? "Upgrade to add more seats"
                  : userToEdit
                    ? "Update User"
                    : "Create User"}
              </Button>
            </div>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}