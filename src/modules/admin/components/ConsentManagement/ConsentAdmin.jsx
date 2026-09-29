'use client'

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   Chip,
//   Paper,
//   Tab,
//   Tabs,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   CircularProgress,
//   Alert,
//   Snackbar,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   InputAdornment,
//   Divider,
//   Collapse,
// } from "@mui/material";
// import {
//   Add,
//   Delete,
//   History,
//   Search,
//   Refresh,
//   CheckCircle,
//   Cancel,
//   ExpandMore,
//   ExpandLess,
//   Gavel,
//   Domain,
//   AssignmentTurnedIn,
//   ManageSearch,
//   FilterList,
//   Person,
//   Business,
//   Description,
// } from "@mui/icons-material";
// import * as api from "../../api/consentApi";

// // ── Constants ─────────────────────────────────────────────────────────────────
// const ACCENT  = "#3b82f6";
// const SUCCESS = "#16a34a";
// const DANGER  = "#dc2626";
// const WARNING = "#d97706";
// const SURFACE = "#f8fafc";
// const BORDER  = "rgba(226, 232, 240, 0.8)";

// const LEGAL_BASIS_OPTIONS = [
//   "CONSENT",
//   "LEGITIMATE_INTEREST",
//   "CONTRACT",
//   "LEGAL_OBLIGATION",
//   "VITAL_INTERESTS",
//   "PUBLIC_TASK",
// ];

// const STATUS_COLORS = {
//   GIVEN:     { bg: "#dcfce7", color: SUCCESS, border: "#bbf7d0" },
//   WITHDRAWN: { bg: "#fee2e2", color: DANGER,  border: "#fecaca" },
//   EXPIRED:   { bg: "#fef3c7", color: WARNING, border: "#fde68a" },
// };

// // ── Helpers ───────────────────────────────────────────────────────────────────
// function TabPanel({ children, value, index }) {
//   return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
// }

// function SectionCard({ title, icon, children, action }) {
//   return (
//     <Paper
//       elevation={0}
//       sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, mb: 3, overflow: "hidden" }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           px: 3,
//           py: 2,
//           borderBottom: `1px solid ${BORDER}`,
//           bgcolor: SURFACE,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//           {icon}
//           <Typography fontWeight={600} fontSize={15}>
//             {title}
//           </Typography>
//         </Box>
//         {action}
//       </Box>
//       <Box sx={{ p: 3 }}>{children}</Box>
//     </Paper>
//   );
// }

// function StatusChip({ status }) {
//   const style = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
//   return (
//     <Chip
//       label={status}
//       size="small"
//       sx={{
//         fontWeight: 700,
//         fontSize: 11,
//         letterSpacing: 0.4,
//         bgcolor: style.bg,
//         color: style.color,
//         border: `1px solid ${style.border}`,
//       }}
//     />
//   );
// }

// function EmptyState({ message }) {
//   return (
//     <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
//       {message}
//     </Typography>
//   );
// }

// // ── Default form states ───────────────────────────────────────────────────────
// const DEFAULT_CLIENT_FORM = {
//   name: "",
//   allowedOrigins: "",   // comma-separated, split on submit
// };

// const DEFAULT_DEFINITION_FORM = {
//   name: "",
//   purpose: "",
//   legalBasis: "CONSENT",
//   jurisdiction: "",
//   consentText: "",
//   expiryDays: "",
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function ConsentAdmin() {
//   const [tab, setTab] = useState(0);
//   const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

//   const toast = (msg, severity = "success") =>
//     setSnack({ open: true, msg, severity });

//   // ── Tab 0: Clients ─────────────────────────────────────────────────────────
//   const [clients, setClients]               = useState([]);
//   const [clientsLoading, setClientsLoading] = useState(true);
//   const [clientDialog, setClientDialog]     = useState(false);
//   const [clientForm, setClientForm]         = useState(DEFAULT_CLIENT_FORM);
//   const [savingClient, setSavingClient]     = useState(false);
//   const [deactivatingClient, setDeactivatingClient] = useState(null);
//   const [confirmDeactivateClient, setConfirmDeactivateClient] = useState(null);

//   const loadClients = useCallback(async () => {
//     setClientsLoading(true);
//     try {
//       const data = await api.listClients();
//       setClients(Array.isArray(data) ? data : data?.clients ?? []);
//     } catch (e) {
//       toast(`Failed to load clients: ${e.message}`, "error");
//     } finally {
//       setClientsLoading(false);
//     }
//   }, []);

//   useEffect(() => { loadClients(); }, [loadClients]);

//   const handleCreateClient = async () => {
//     if (!clientForm.name.trim()) return;
//     setSavingClient(true);
//     try {
//       const payload = {
//         name: clientForm.name.trim(),
//         allowedOrigins: clientForm.allowedOrigins
//           .split(",")
//           .map((s) => s.trim())
//           .filter(Boolean),
//       };
//       await api.createClient(payload);
//       toast("Client created successfully.");
//       setClientDialog(false);
//       setClientForm(DEFAULT_CLIENT_FORM);
//       loadClients();
//     } catch (e) {
//       toast(`Failed to create client: ${e.message}`, "error");
//     } finally {
//       setSavingClient(false);
//     }
//   };

//   const handleDeactivateClient = async (client) => {
//     setDeactivatingClient(client.id);
//     try {
//       await api.deactivateClient(client.id);
//       toast(`Client "${client.name}" deactivated.`);
//       setConfirmDeactivateClient(null);
//       loadClients();
//     } catch (e) {
//       toast(`Failed to deactivate: ${e.message}`, "error");
//     } finally {
//       setDeactivatingClient(null);
//     }
//   };

//   // ── Tab 1: Definitions ─────────────────────────────────────────────────────
//   const [selectedClientId, setSelectedClientId]   = useState("");
//   const [definitions, setDefinitions]             = useState([]);
//   const [defsLoading, setDefsLoading]             = useState(false);
//   const [defDialog, setDefDialog]                 = useState(false);
//   const [defForm, setDefForm]                     = useState(DEFAULT_DEFINITION_FORM);
//   const [savingDef, setSavingDef]                 = useState(false);
//   const [confirmDeactivateDef, setConfirmDeactivateDef] = useState(null);
//   const [deactivatingDef, setDeactivatingDef]     = useState(null);

//   const loadDefinitions = useCallback(async (clientId) => {
//     if (!clientId) return;
//     setDefsLoading(true);
//     try {
//       const data = await api.listDefinitions(clientId);
//       setDefinitions(Array.isArray(data) ? data : data?.definitions ?? []);
//     } catch (e) {
//       toast(`Failed to load definitions: ${e.message}`, "error");
//     } finally {
//       setDefsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (selectedClientId) loadDefinitions(selectedClientId);
//     else setDefinitions([]);
//   }, [selectedClientId, loadDefinitions]);

//   const handleCreateDefinition = async () => {
//     if (!selectedClientId || !defForm.name.trim()) return;
//     setSavingDef(true);
//     try {
//       const payload = {
//         ...defForm,
//         expiryDays: defForm.expiryDays ? parseInt(defForm.expiryDays, 10) : undefined,
//       };
//       await api.createDefinition(selectedClientId, payload);
//       toast("Consent definition created.");
//       setDefDialog(false);
//       setDefForm(DEFAULT_DEFINITION_FORM);
//       loadDefinitions(selectedClientId);
//     } catch (e) {
//       toast(`Failed to create definition: ${e.message}`, "error");
//     } finally {
//       setSavingDef(false);
//     }
//   };

//   const handleDeactivateDefinition = async (def) => {
//     setDeactivatingDef(def.id);
//     try {
//       await api.deactivateDefinition(selectedClientId, def.id);
//       toast(`Definition "${def.name}" deactivated.`);
//       setConfirmDeactivateDef(null);
//       loadDefinitions(selectedClientId);
//     } catch (e) {
//       toast(`Failed to deactivate: ${e.message}`, "error");
//     } finally {
//       setDeactivatingDef(null);
//     }
//   };

//   // ── Tab 2: Consent Records ─────────────────────────────────────────────────
//   const [records, setRecords]               = useState([]);
//   const [recordsLoading, setRecordsLoading] = useState(false);
//   const [recordFilters, setRecordFilters]   = useState({
//     clientId: "",
//     definitionId: "",
//     endUserRef: "",
//     status: "",
//   });
//   const [filtersOpen, setFiltersOpen]       = useState(true);

//   const loadRecords = useCallback(async (filters = {}) => {
//     setRecordsLoading(true);
//     try {
//       const data = await api.listConsents(filters);
//       setRecords(Array.isArray(data) ? data : data?.consents ?? []);
//     } catch (e) {
//       toast(`Failed to load consent records: ${e.message}`, "error");
//     } finally {
//       setRecordsLoading(false);
//     }
//   }, []);

//   // Load records when switching to tab 2
//   useEffect(() => {
//     if (tab === 2) loadRecords(recordFilters);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tab]);

//   const applyRecordFilters = () => loadRecords(recordFilters);

//   const resetRecordFilters = () => {
//     const cleared = { clientId: "", definitionId: "", endUserRef: "", status: "" };
//     setRecordFilters(cleared);
//     loadRecords(cleared);
//   };

//   // ── Tab 3: Audit History ───────────────────────────────────────────────────
//   const [auditClientId, setAuditClientId]   = useState("");
//   const [auditUserRef, setAuditUserRef]     = useState("");
//   const [auditHistory, setAuditHistory]     = useState([]);
//   const [auditLoading, setAuditLoading]     = useState(false);
//   // Per-record history (inline expand)
//   const [recordHistoryId, setRecordHistoryId]   = useState(null);
//   const [recordHistory, setRecordHistory]       = useState([]);
//   const [recordHistoryLoading, setRecordHistoryLoading] = useState(false);

//   const loadUserAudit = async () => {
//     if (!auditClientId.trim() || !auditUserRef.trim()) {
//       toast("Please enter both Client ID and End User Ref.", "warning");
//       return;
//     }
//     setAuditLoading(true);
//     try {
//       const data = await api.getUserAuditHistory(auditClientId.trim(), auditUserRef.trim());
//       setAuditHistory(Array.isArray(data) ? data : data?.history ?? []);
//     } catch (e) {
//       toast(`Failed to load audit history: ${e.message}`, "error");
//     } finally {
//       setAuditLoading(false);
//     }
//   };

//   const loadRecordHistory = async (recordId) => {
//     if (recordHistoryId === recordId) {
//       // toggle off
//       setRecordHistoryId(null);
//       setRecordHistory([]);
//       return;
//     }
//     setRecordHistoryId(recordId);
//     setRecordHistoryLoading(true);
//     try {
//       const data = await api.getConsentHistory(recordId);
//       setRecordHistory(Array.isArray(data) ? data : data?.history ?? []);
//     } catch (e) {
//       toast(`Failed to load record history: ${e.message}`, "error");
//     } finally {
//       setRecordHistoryLoading(false);
//     }
//   };

//   // ── Shared helpers ─────────────────────────────────────────────────────────
//   const clientName = (id) =>
//     clients.find((c) => c.id === id)?.name ?? id ?? "—";

//   const formatDate = (val) => {
//     if (!val) return "—";
//     try { return new Date(val).toLocaleString(); } catch (_) { return val; }
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>

//       {/* ── Page Header ─────────────────────────────────────────────────── */}
//       <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
//         <Box>
//           <Typography variant="h5" fontWeight={700} letterSpacing={-0.5}>
//             Consent Management
//           </Typography>
//           <Typography variant="body2" color="text.secondary" mt={0.5}>
//             Manage clients, consent definitions, records, and audit trails
//           </Typography>
//         </Box>
//       </Box>

//       {/* ── Tabs ────────────────────────────────────────────────────────── */}
//       <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, overflow: "hidden" }}>
//         <Tabs
//           value={tab}
//           onChange={(_, v) => setTab(v)}
//           sx={{
//             borderBottom: `1px solid ${BORDER}`,
//             bgcolor: SURFACE,
//             "& .MuiTab-root": { fontSize: 13, fontWeight: 600, textTransform: "none", minWidth: 140 },
//             "& .Mui-selected": { color: ACCENT },
//             "& .MuiTabs-indicator": { bgcolor: ACCENT },
//           }}
//         >
//           <Tab icon={<Business fontSize="small" />} iconPosition="start" label="Clients" />
//           <Tab icon={<Description fontSize="small" />} iconPosition="start" label="Definitions" />
//           <Tab icon={<AssignmentTurnedIn fontSize="small" />} iconPosition="start" label="Consent Records" />
//           <Tab icon={<ManageSearch fontSize="small" />} iconPosition="start" label="Audit History" />
//         </Tabs>

//         <Box sx={{ p: 3 }}>

//           {/* ══════════════════════════════════════════════════════════════
//               TAB 0 — CLIENTS
//           ══════════════════════════════════════════════════════════════ */}
//           <TabPanel value={tab} index={0}>
//             <SectionCard
//               title="Registered Clients"
//               icon={<Business sx={{ color: ACCENT, fontSize: 20 }} />}
//               action={
//                 <Button
//                   variant="contained"
//                   size="small"
//                   startIcon={<Add />}
//                   onClick={() => setClientDialog(true)}
//                   sx={{ bgcolor: ACCENT, fontSize: 12 }}
//                 >
//                   New Client
//                 </Button>
//               }
//             >
//               {clientsLoading ? (
//                 <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//                   <CircularProgress size={28} sx={{ color: ACCENT }} />
//                 </Box>
//               ) : clients.length === 0 ? (
//                 <EmptyState message="No clients registered yet. Create your first client to get started." />
//               ) : (
//                 <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1 }}>
//                   <Table size="small">
//                     <TableHead sx={{ bgcolor: SURFACE }}>
//                       <TableRow>
//                         <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Client ID</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Allowed Origins</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
//                         <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {clients.map((c) => (
//                         <TableRow key={c.id} hover>
//                           <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
//                           <TableCell>
//                             <Typography
//                               variant="caption"
//                               sx={{ fontFamily: "monospace", bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}
//                             >
//                               {c.id}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
//                               {(c.allowedOrigins ?? []).map((o) => (
//                                 <Chip key={o} label={o} size="small" sx={{ fontSize: 11, bgcolor: "#eff6ff", color: ACCENT }} />
//                               ))}
//                             </Box>
//                           </TableCell>
//                           <TableCell>
//                             <Chip
//                               label={c.active === false ? "INACTIVE" : "ACTIVE"}
//                               size="small"
//                               icon={c.active === false
//                                 ? <Cancel sx={{ fontSize: "14px !important" }} />
//                                 : <CheckCircle sx={{ fontSize: "14px !important" }} />}
//                               sx={{
//                                 fontWeight: 700,
//                                 fontSize: 11,
//                                 bgcolor: c.active === false ? "#fee2e2" : "#dcfce7",
//                                 color: c.active === false ? DANGER : SUCCESS,
//                                 border: `1px solid ${c.active === false ? "#fecaca" : "#bbf7d0"}`,
//                               }}
//                             />
//                           </TableCell>
//                           <TableCell>{formatDate(c.createdAt)}</TableCell>
//                           <TableCell align="right">
//                             {c.active !== false && (
//                               <Tooltip title="Deactivate client">
//                                 <IconButton
//                                   size="small"
//                                   onClick={() => setConfirmDeactivateClient(c)}
//                                 >
//                                   <Delete fontSize="small" sx={{ color: DANGER }} />
//                                 </IconButton>
//                               </Tooltip>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               )}

//               {/* Refresh */}
//               <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
//                 <Button
//                   size="small"
//                   startIcon={<Refresh />}
//                   onClick={loadClients}
//                   disabled={clientsLoading}
//                   sx={{ color: "text.secondary" }}
//                 >
//                   Refresh
//                 </Button>
//               </Box>
//             </SectionCard>
//           </TabPanel>

//           {/* ══════════════════════════════════════════════════════════════
//               TAB 1 — DEFINITIONS
//           ══════════════════════════════════════════════════════════════ */}
//           <TabPanel value={tab} index={1}>

//             {/* Client picker */}
//             <SectionCard
//               title="Select Client"
//               icon={<Business sx={{ color: ACCENT, fontSize: 20 }} />}
//             >
//               <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
//                 <FormControl size="small" sx={{ minWidth: 280 }}>
//                   <InputLabel>Client</InputLabel>
//                   <Select
//                     label="Client"
//                     value={selectedClientId}
//                     onChange={(e) => setSelectedClientId(e.target.value)}
//                   >
//                     <MenuItem value=""><em>— Select a client —</em></MenuItem>
//                     {clients.map((c) => (
//                       <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//                 {selectedClientId && (
//                   <Button
//                     variant="contained"
//                     size="small"
//                     startIcon={<Add />}
//                     onClick={() => setDefDialog(true)}
//                     sx={{ bgcolor: ACCENT, fontSize: 12 }}
//                   >
//                     New Definition
//                   </Button>
//                 )}
//               </Box>
//             </SectionCard>

//             {/* Definitions table */}
//             {selectedClientId && (
//               <SectionCard
//                 title={`Consent Definitions — ${clientName(selectedClientId)}`}
//                 icon={<Gavel sx={{ color: ACCENT, fontSize: 20 }} />}
//               >
//                 {defsLoading ? (
//                   <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//                     <CircularProgress size={28} sx={{ color: ACCENT }} />
//                   </Box>
//                 ) : definitions.length === 0 ? (
//                   <EmptyState message="No definitions found for this client." />
//                 ) : (
//                   <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1 }}>
//                     <Table size="small">
//                       <TableHead sx={{ bgcolor: SURFACE }}>
//                         <TableRow>
//                           <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
//                           <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
//                           <TableCell sx={{ fontWeight: 600 }}>Legal Basis</TableCell>
//                           <TableCell sx={{ fontWeight: 600 }}>Jurisdiction</TableCell>
//                           <TableCell sx={{ fontWeight: 600 }}>Expiry (days)</TableCell>
//                           <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
//                           <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {definitions.map((d) => (
//                           <TableRow key={d.id} hover>
//                             <TableCell sx={{ fontWeight: 600 }}>{d.name}</TableCell>
//                             <TableCell sx={{ maxWidth: 200 }}>
//                               <Tooltip title={d.purpose || ""}>
//                                 <Typography variant="body2" noWrap>{d.purpose || "—"}</Typography>
//                               </Tooltip>
//                             </TableCell>
//                             <TableCell>
//                               <Chip
//                                 label={d.legalBasis || "—"}
//                                 size="small"
//                                 sx={{ fontSize: 11, bgcolor: "#eff6ff", color: ACCENT, fontWeight: 600 }}
//                               />
//                             </TableCell>
//                             <TableCell>{d.jurisdiction || "—"}</TableCell>
//                             <TableCell>{d.expiryDays ?? "—"}</TableCell>
//                             <TableCell>
//                               <Chip
//                                 label={d.active === false ? "INACTIVE" : "ACTIVE"}
//                                 size="small"
//                                 sx={{
//                                   fontWeight: 700,
//                                   fontSize: 11,
//                                   bgcolor: d.active === false ? "#fee2e2" : "#dcfce7",
//                                   color: d.active === false ? DANGER : SUCCESS,
//                                 }}
//                               />
//                             </TableCell>
//                             <TableCell align="right">
//                               {d.active !== false && (
//                                 <Tooltip title="Deactivate definition">
//                                   <IconButton
//                                     size="small"
//                                     onClick={() => setConfirmDeactivateDef(d)}
//                                   >
//                                     <Delete fontSize="small" sx={{ color: DANGER }} />
//                                   </IconButton>
//                                 </Tooltip>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                 )}

//                 <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
//                   <Button
//                     size="small"
//                     startIcon={<Refresh />}
//                     onClick={() => loadDefinitions(selectedClientId)}
//                     disabled={defsLoading}
//                     sx={{ color: "text.secondary" }}
//                   >
//                     Refresh
//                   </Button>
//                 </Box>
//               </SectionCard>
//             )}
//           </TabPanel>

//           {/* ══════════════════════════════════════════════════════════════
//               TAB 2 — CONSENT RECORDS
//           ══════════════════════════════════════════════════════════════ */}
//           <TabPanel value={tab} index={2}>

//             {/* Filters */}
//             <SectionCard
//               title="Filters"
//               icon={<FilterList sx={{ color: ACCENT, fontSize: 20 }} />}
//               action={
//                 <IconButton size="small" onClick={() => setFiltersOpen((p) => !p)}>
//                   {filtersOpen ? <ExpandLess /> : <ExpandMore />}
//                 </IconButton>
//               }
//             >
//               <Collapse in={filtersOpen}>
//                 <Box
//                   sx={{
//                     display: "grid",
//                     gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
//                     gap: 2,
//                     mb: 2,
//                   }}
//                 >
//                   <FormControl size="small">
//                     <InputLabel>Client</InputLabel>
//                     <Select
//                       label="Client"
//                       value={recordFilters.clientId}
//                       onChange={(e) => setRecordFilters((f) => ({ ...f, clientId: e.target.value }))}
//                     >
//                       <MenuItem value=""><em>All clients</em></MenuItem>
//                       {clients.map((c) => (
//                         <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>

//                   <TextField
//                     size="small"
//                     label="Definition ID"
//                     value={recordFilters.definitionId}
//                     onChange={(e) => setRecordFilters((f) => ({ ...f, definitionId: e.target.value }))}
//                   />

//                   <TextField
//                     size="small"
//                     label="End User Ref"
//                     value={recordFilters.endUserRef}
//                     onChange={(e) => setRecordFilters((f) => ({ ...f, endUserRef: e.target.value }))}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <Person sx={{ fontSize: 18, color: "text.secondary" }} />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />

//                   <FormControl size="small">
//                     <InputLabel>Status</InputLabel>
//                     <Select
//                       label="Status"
//                       value={recordFilters.status}
//                       onChange={(e) => setRecordFilters((f) => ({ ...f, status: e.target.value }))}
//                     >
//                       <MenuItem value=""><em>All statuses</em></MenuItem>
//                       <MenuItem value="GIVEN">GIVEN</MenuItem>
//                       <MenuItem value="WITHDRAWN">WITHDRAWN</MenuItem>
//                       <MenuItem value="EXPIRED">EXPIRED</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>

//                 <Box sx={{ display: "flex", gap: 1 }}>
//                   <Button
//                     variant="contained"
//                     size="small"
//                     startIcon={<Search />}
//                     onClick={applyRecordFilters}
//                     disabled={recordsLoading}
//                     sx={{ bgcolor: ACCENT }}
//                   >
//                     Apply Filters
//                   </Button>
//                   <Button
//                     size="small"
//                     startIcon={<Refresh />}
//                     onClick={resetRecordFilters}
//                     disabled={recordsLoading}
//                     sx={{ color: "text.secondary" }}
//                   >
//                     Reset
//                   </Button>
//                 </Box>
//               </Collapse>
//             </SectionCard>

//             {/* Records table */}
//             <SectionCard
//               title={`Consent Records ${records.length > 0 ? `(${records.length})` : ""}`}
//               icon={<AssignmentTurnedIn sx={{ color: ACCENT, fontSize: 20 }} />}
//             >
//               {recordsLoading ? (
//                 <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//                   <CircularProgress size={28} sx={{ color: ACCENT }} />
//                 </Box>
//               ) : records.length === 0 ? (
//                 <EmptyState message="No consent records found. Adjust filters and try again." />
//               ) : (
//                 <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1 }}>
//                   <Table size="small">
//                     <TableHead sx={{ bgcolor: SURFACE }}>
//                       <TableRow>
//                         <TableCell sx={{ fontWeight: 600 }}>End User Ref</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Definition</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Form ID</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Updated</TableCell>
//                         <TableCell align="right" sx={{ fontWeight: 600 }}>History</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {records.map((r) => (
//                         <React.Fragment key={r.id}>
//                           <TableRow hover>
//                             <TableCell>
//                               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                                 <Person sx={{ fontSize: 16, color: "text.secondary" }} />
//                                 <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 12 }}>
//                                   {r.endUserRef}
//                                 </Typography>
//                               </Box>
//                             </TableCell>
//                             <TableCell>{clientName(r.clientId)}</TableCell>
//                             <TableCell>
//                               <Tooltip title={r.consentDefinitionId || ""}>
//                                 <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
//                                   {r.consentDefinitionId?.slice(0, 8)}…
//                                 </Typography>
//                               </Tooltip>
//                             </TableCell>
//                             <TableCell>
//                               <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
//                                 {r.formId || "—"}
//                               </Typography>
//                             </TableCell>
//                             <TableCell><StatusChip status={r.status} /></TableCell>
//                             <TableCell>{formatDate(r.updatedAt ?? r.createdAt)}</TableCell>
//                             <TableCell align="right">
//                               <Tooltip title="View audit history for this record">
//                                 <IconButton
//                                   size="small"
//                                   onClick={() => loadRecordHistory(r.id)}
//                                   sx={{ color: recordHistoryId === r.id ? ACCENT : "text.secondary" }}
//                                 >
//                                   {recordHistoryLoading && recordHistoryId === r.id
//                                     ? <CircularProgress size={16} />
//                                     : <History fontSize="small" />}
//                                 </IconButton>
//                               </Tooltip>
//                             </TableCell>
//                           </TableRow>

//                           {/* Inline record history */}
//                           {recordHistoryId === r.id && (
//                             <TableRow>
//                               <TableCell colSpan={7} sx={{ p: 0, bgcolor: "#f8fafc" }}>
//                                 <Box sx={{ px: 4, py: 2 }}>
//                                   <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
//                                     Audit Trail — {r.endUserRef}
//                                   </Typography>
//                                   {recordHistoryLoading ? (
//                                     <CircularProgress size={16} sx={{ ml: 2, color: ACCENT }} />
//                                   ) : recordHistory.length === 0 ? (
//                                     <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
//                                       No history entries.
//                                     </Typography>
//                                   ) : (
//                                     <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
//                                       {recordHistory.map((h, i) => (
//                                         <Box
//                                           key={i}
//                                           sx={{
//                                             display: "flex",
//                                             alignItems: "center",
//                                             gap: 2,
//                                             py: 0.75,
//                                             borderBottom: i < recordHistory.length - 1 ? `1px solid ${BORDER}` : "none",
//                                           }}
//                                         >
//                                           <StatusChip status={h.status} />
//                                           <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
//                                             {formatDate(h.changedAt ?? h.createdAt)}
//                                           </Typography>
//                                           {h.formId && (
//                                             <Typography variant="caption" color="text.secondary">
//                                               form: {h.formId}
//                                             </Typography>
//                                           )}
//                                           {h.ipAddress && (
//                                             <Typography variant="caption" color="text.secondary">
//                                               ip: {h.ipAddress}
//                                             </Typography>
//                                           )}
//                                         </Box>
//                                       ))}
//                                     </Box>
//                                   )}
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           )}
//                         </React.Fragment>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               )}
//             </SectionCard>
//           </TabPanel>

//           {/* ══════════════════════════════════════════════════════════════
//               TAB 3 — AUDIT HISTORY
//           ══════════════════════════════════════════════════════════════ */}
//           <TabPanel value={tab} index={3}>

//             {/* User search */}
//             <SectionCard
//               title="Full User Audit History"
//               icon={<Person sx={{ color: ACCENT, fontSize: 20 }} />}
//             >
//               <Typography variant="body2" color="text.secondary" mb={2}>
//                 View the complete consent lifecycle for a specific end user across a client.
//               </Typography>
//               <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 1 }}>
//                 <FormControl size="small" sx={{ minWidth: 240 }}>
//                   <InputLabel>Client</InputLabel>
//                   <Select
//                     label="Client"
//                     value={auditClientId}
//                     onChange={(e) => setAuditClientId(e.target.value)}
//                   >
//                     <MenuItem value=""><em>— Select client —</em></MenuItem>
//                     {clients.map((c) => (
//                       <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <TextField
//                   size="small"
//                   label="End User Ref"
//                   placeholder="e.g. user-ref-abc123"
//                   value={auditUserRef}
//                   onChange={(e) => setAuditUserRef(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && loadUserAudit()}
//                   sx={{ minWidth: 260 }}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <Person sx={{ fontSize: 18, color: "text.secondary" }} />
//                       </InputAdornment>
//                     ),
//                   }}
//                 />

//                 <Button
//                   variant="contained"
//                   size="small"
//                   startIcon={auditLoading ? <CircularProgress size={16} color="inherit" /> : <Search />}
//                   onClick={loadUserAudit}
//                   disabled={auditLoading || !auditClientId || !auditUserRef.trim()}
//                   sx={{ bgcolor: ACCENT }}
//                 >
//                   {auditLoading ? "Loading…" : "Fetch History"}
//                 </Button>
//               </Box>
//             </SectionCard>

//             {/* Audit results */}
//             {auditHistory.length > 0 && (
//               <SectionCard
//                 title={`Audit Trail — ${auditUserRef} (${auditHistory.length} entries)`}
//                 icon={<History sx={{ color: ACCENT, fontSize: 20 }} />}
//               >
//                 <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1 }}>
//                   <Table size="small">
//                     <TableHead sx={{ bgcolor: SURFACE }}>
//                       <TableRow>
//                         <TableCell sx={{ fontWeight: 600 }}>Definition</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Form ID</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Changed At</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
//                         <TableCell sx={{ fontWeight: 600 }}>Origin</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {auditHistory.map((h, i) => (
//                         <TableRow key={i} hover>
//                           <TableCell>
//                             <Tooltip title={h.consentDefinitionId || h.definitionId || ""}>
//                               <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
//                                 {(h.consentDefinitionId ?? h.definitionId ?? "—").slice(0, 8)}…
//                               </Typography>
//                             </Tooltip>
//                           </TableCell>
//                           <TableCell>
//                             <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
//                               {h.formId || "—"}
//                             </Typography>
//                           </TableCell>
//                           <TableCell><StatusChip status={h.status} /></TableCell>
//                           <TableCell>{formatDate(h.changedAt ?? h.createdAt)}</TableCell>
//                           <TableCell>{h.ipAddress || "—"}</TableCell>
//                           <TableCell>
//                             {h.origin ? (
//                               <Chip
//                                 label={h.origin}
//                                 size="small"
//                                 icon={<Domain sx={{ fontSize: "14px !important" }} />}
//                                 sx={{ fontSize: 11, bgcolor: "#f1f5f9" }}
//                               />
//                             ) : "—"}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </SectionCard>
//             )}
//           </TabPanel>

//         </Box>
//       </Paper>

//       {/* ══════════════════════════════════════════════════════════════════════
//           DIALOGS
//       ══════════════════════════════════════════════════════════════════════ */}

//       {/* Create Client Dialog */}
//       <Dialog
//         open={clientDialog}
//         onClose={() => setClientDialog(false)}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: 2 } }}
//       >
//         <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${BORDER}` }}>
//           Register New Client
//         </DialogTitle>
//         <DialogContent sx={{ pt: 3 }}>
//           <Box sx={{ display: "grid", gap: 2.5, mt: 1 }}>
//             <TextField
//               size="small"
//               label="Client Name *"
//               fullWidth
//               value={clientForm.name}
//               onChange={(e) => setClientForm((f) => ({ ...f, name: e.target.value }))}
//               placeholder="e.g. Acme Corp"
//             />
//             <TextField
//               size="small"
//               label="Allowed Origins"
//               fullWidth
//               value={clientForm.allowedOrigins}
//               onChange={(e) => setClientForm((f) => ({ ...f, allowedOrigins: e.target.value }))}
//               placeholder="https://acmecorp.com, https://hr.acmecorp.com"
//               helperText="Comma-separated. Consent recording requests from other origins will be blocked."
//               multiline
//               rows={2}
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={() => setClientDialog(false)} sx={{ color: "text.secondary" }}>
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleCreateClient}
//             disabled={savingClient || !clientForm.name.trim()}
//             sx={{ bgcolor: ACCENT }}
//           >
//             {savingClient ? "Creating…" : "Create Client"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Create Definition Dialog */}
//       <Dialog
//         open={defDialog}
//         onClose={() => setDefDialog(false)}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: 2 } }}
//       >
//         <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${BORDER}` }}>
//           New Consent Definition
//         </DialogTitle>
//         <DialogContent sx={{ pt: 3 }}>
//           <Box sx={{ display: "grid", gap: 2.5, mt: 1 }}>
//             <TextField
//               size="small"
//               label="Definition Name *"
//               fullWidth
//               value={defForm.name}
//               onChange={(e) => setDefForm((f) => ({ ...f, name: e.target.value }))}
//               placeholder="e.g. Marketing Email Consent v2"
//             />
//             <TextField
//               size="small"
//               label="Purpose"
//               fullWidth
//               value={defForm.purpose}
//               onChange={(e) => setDefForm((f) => ({ ...f, purpose: e.target.value }))}
//               placeholder="e.g. Sending promotional emails"
//             />
//             <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
//               <FormControl size="small">
//                 <InputLabel>Legal Basis *</InputLabel>
//                 <Select
//                   label="Legal Basis *"
//                   value={defForm.legalBasis}
//                   onChange={(e) => setDefForm((f) => ({ ...f, legalBasis: e.target.value }))}
//                 >
//                   {LEGAL_BASIS_OPTIONS.map((lb) => (
//                     <MenuItem key={lb} value={lb}>{lb}</MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//               <TextField
//                 size="small"
//                 label="Jurisdiction"
//                 value={defForm.jurisdiction}
//                 onChange={(e) => setDefForm((f) => ({ ...f, jurisdiction: e.target.value }))}
//                 placeholder="e.g. GDPR, CCPA"
//               />
//             </Box>
//             <TextField
//               size="small"
//               label="Consent Text"
//               fullWidth
//               multiline
//               rows={3}
//               value={defForm.consentText}
//               onChange={(e) => setDefForm((f) => ({ ...f, consentText: e.target.value }))}
//               placeholder="I agree to receive marketing communications from…"
//             />
//             <TextField
//               size="small"
//               label="Expiry (days)"
//               type="number"
//               fullWidth
//               value={defForm.expiryDays}
//               onChange={(e) => setDefForm((f) => ({ ...f, expiryDays: e.target.value }))}
//               placeholder="e.g. 365  (leave blank for no expiry)"
//               inputProps={{ min: 1 }}
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={() => setDefDialog(false)} sx={{ color: "text.secondary" }}>
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleCreateDefinition}
//             disabled={savingDef || !defForm.name.trim()}
//             sx={{ bgcolor: ACCENT }}
//           >
//             {savingDef ? "Creating…" : "Create Definition"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Confirm Deactivate Client */}
//       <Dialog
//         open={!!confirmDeactivateClient}
//         onClose={() => setConfirmDeactivateClient(null)}
//         maxWidth="xs"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: 2 } }}
//       >
//         <DialogTitle sx={{ fontWeight: 700 }}>Deactivate Client?</DialogTitle>
//         <DialogContent>
//           <Alert severity="warning" sx={{ mb: 1 }}>
//             Deactivating <strong>{confirmDeactivateClient?.name}</strong> will immediately block all
//             consent recording from its registered domains. This cannot be undone.
//           </Alert>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={() => setConfirmDeactivateClient(null)} sx={{ color: "text.secondary" }}>
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={() => handleDeactivateClient(confirmDeactivateClient)}
//             disabled={!!deactivatingClient}
//             sx={{ bgcolor: DANGER, "&:hover": { bgcolor: "#b91c1c" } }}
//           >
//             {deactivatingClient ? "Deactivating…" : "Deactivate"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Confirm Deactivate Definition */}
//       <Dialog
//         open={!!confirmDeactivateDef}
//         onClose={() => setConfirmDeactivateDef(null)}
//         maxWidth="xs"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: 2 } }}
//       >
//         <DialogTitle sx={{ fontWeight: 700 }}>Deactivate Definition?</DialogTitle>
//         <DialogContent>
//           <Alert severity="warning" sx={{ mb: 1 }}>
//             Deactivating <strong>{confirmDeactivateDef?.name}</strong> will prevent new consents from
//             being recorded against it. Existing records are preserved.
//           </Alert>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={() => setConfirmDeactivateDef(null)} sx={{ color: "text.secondary" }}>
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={() => handleDeactivateDefinition(confirmDeactivateDef)}
//             disabled={!!deactivatingDef}
//             sx={{ bgcolor: DANGER, "&:hover": { bgcolor: "#b91c1c" } }}
//           >
//             {deactivatingDef ? "Deactivating…" : "Deactivate"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Global Snackbar */}
//       <Snackbar
//         open={snack.open}
//         autoHideDuration={4000}
//         onClose={() => setSnack((s) => ({ ...s, open: false }))}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <Alert
//           severity={snack.severity}
//           variant="filled"
//           onClose={() => setSnack((s) => ({ ...s, open: false }))}
//         >
//           {snack.msg}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Divider,
  Collapse,
} from "@mui/material";
import {
  Add,
  Delete,
  History,
  Search,
  Refresh,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  Gavel,
  Domain,
  AssignmentTurnedIn,
  ManageSearch,
  FilterList,
  Person,
  Business,
  Description,
} from "@mui/icons-material";
import * as api from "../../api/adminConsentApi";

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCENT  = "#3b82f6";
const SUCCESS = "#16a34a";
const DANGER  = "#dc2626";
const WARNING = "#d97706";
const SURFACE = "#f8fafc";
const BORDER  = "rgba(226, 232, 240, 0.8)";

const LEGAL_BASIS_OPTIONS = [
  "CONSENT",
  "LEGITIMATE_INTEREST",
  "CONTRACT",
  "LEGAL_OBLIGATION",
  "VITAL_INTERESTS",
  "PUBLIC_TASK",
];

const STATUS_COLORS = {
  GIVEN:     { bg: "#dcfce7", color: SUCCESS, border: "#bbf7d0" },
  WITHDRAWN: { bg: "#fee2e2", color: DANGER,  border: "#fecaca" },
  EXPIRED:   { bg: "#fef3c7", color: WARNING, border: "#fde68a" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

function SectionCard({ title, icon, children, action }) {
  return (
    <Paper
      elevation={0}
      sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, mb: 3, overflow: "hidden" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: `1px solid ${BORDER}`,
          bgcolor: SURFACE,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {icon}
          <Typography fontWeight={600} fontSize={15}>
            {title}
          </Typography>
        </Box>
        {action}
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}

function StatusChip({ status }) {
  const style = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: 0.4,
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    />
  );
}

function EmptyState({ message }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
      {message}
    </Typography>
  );
}

// ── Default form states ───────────────────────────────────────────────────────
const DEFAULT_CLIENT_FORM = {
  name: "",
  allowedOrigins: "",   // comma-separated, split on submit
};

// ── FIX 1: Added `version` field; renamed `purpose` → `description` to match API ──
const DEFAULT_DEFINITION_FORM = {
  name: "",
  description: "",       // was `purpose` — API field is `description`
  version: "",           // NEW: required by API
  legalBasis: "CONSENT",
  jurisdiction: "",
  consentText: "",
  expiryDays: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ConsentAdmin() {
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const toast = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  // ── Tab 0: Clients ─────────────────────────────────────────────────────────
  const [clients, setClients]               = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientDialog, setClientDialog]     = useState(false);
  const [clientForm, setClientForm]         = useState(DEFAULT_CLIENT_FORM);
  const [savingClient, setSavingClient]     = useState(false);
  const [deactivatingClient, setDeactivatingClient] = useState(null);
  const [confirmDeactivateClient, setConfirmDeactivateClient] = useState(null);

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const data = await api.listClients();
      setClients(Array.isArray(data) ? data : data?.clients ?? []);
    } catch (e) {
      toast(`Failed to load clients: ${e.message}`, "error");
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const handleCreateClient = async () => {
    if (!clientForm.name.trim()) return;
    setSavingClient(true);
    try {
      const payload = {
        name: clientForm.name.trim(),
        allowedOrigins: clientForm.allowedOrigins
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await api.createClient(payload);
      toast("Client created successfully.");
      setClientDialog(false);
      setClientForm(DEFAULT_CLIENT_FORM);
      loadClients();
    } catch (e) {
      toast(`Failed to create client: ${e.message}`, "error");
    } finally {
      setSavingClient(false);
    }
  };

  const handleDeactivateClient = async (client) => {
    setDeactivatingClient(client.id);
    try {
      await api.deactivateClient(client.id);
      toast(`Client "${client.name}" deactivated.`);
      setConfirmDeactivateClient(null);
      loadClients();
    } catch (e) {
      toast(`Failed to deactivate: ${e.message}`, "error");
    } finally {
      setDeactivatingClient(null);
    }
  };

  // ── Tab 1: Definitions ─────────────────────────────────────────────────────
  const [selectedClientId, setSelectedClientId]   = useState("");
  const [definitions, setDefinitions]             = useState([]);
  const [defsLoading, setDefsLoading]             = useState(false);
  const [defDialog, setDefDialog]                 = useState(false);
  const [defForm, setDefForm]                     = useState(DEFAULT_DEFINITION_FORM);
  const [savingDef, setSavingDef]                 = useState(false);
  const [confirmDeactivateDef, setConfirmDeactivateDef] = useState(null);
  const [deactivatingDef, setDeactivatingDef]     = useState(null);

  const loadDefinitions = useCallback(async (clientId) => {
    if (!clientId) return;
    setDefsLoading(true);
    try {
      const data = await api.listDefinitions(clientId);
      setDefinitions(Array.isArray(data) ? data : data?.definitions ?? []);
    } catch (e) {
      toast(`Failed to load definitions: ${e.message}`, "error");
    } finally {
      setDefsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClientId) loadDefinitions(selectedClientId);
    else setDefinitions([]);
  }, [selectedClientId, loadDefinitions]);

  // ── FIX 2: Payload now sends `description` and `version` instead of `purpose` ──
  const handleCreateDefinition = async () => {
    if (!selectedClientId || !defForm.name.trim()) return;
    setSavingDef(true);
    try {
      const payload = {
        name: defForm.name.trim(),
        description: defForm.description.trim(),   // was `purpose`
        version: defForm.version.trim(),            // NEW required field
        legalBasis: defForm.legalBasis,
        jurisdiction: defForm.jurisdiction.trim(),
        consentText: defForm.consentText.trim(),
        expiryDays: defForm.expiryDays ? parseInt(defForm.expiryDays, 10) : undefined,
      };
      await api.createDefinition(selectedClientId, payload);
      toast("Consent definition created.");
      setDefDialog(false);
      setDefForm(DEFAULT_DEFINITION_FORM);
      loadDefinitions(selectedClientId);
    } catch (e) {
      toast(`Failed to create definition: ${e.message}`, "error");
    } finally {
      setSavingDef(false);
    }
  };

  const handleDeactivateDefinition = async (def) => {
    setDeactivatingDef(def.id);
    try {
      await api.deactivateDefinition(selectedClientId, def.id);
      toast(`Definition "${def.name}" deactivated.`);
      setConfirmDeactivateDef(null);
      loadDefinitions(selectedClientId);
    } catch (e) {
      toast(`Failed to deactivate: ${e.message}`, "error");
    } finally {
      setDeactivatingDef(null);
    }
  };

  // ── Tab 2: Consent Records ─────────────────────────────────────────────────
  const [records, setRecords]               = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordFilters, setRecordFilters]   = useState({
    clientId: "",
    definitionId: "",
    endUserRef: "",
    status: "",
  });
  const [filtersOpen, setFiltersOpen]       = useState(true);

  const loadRecords = useCallback(async (filters = {}) => {
    setRecordsLoading(true);
    try {
      const data = await api.listConsents(filters);
      setRecords(Array.isArray(data) ? data : data?.consents ?? []);
    } catch (e) {
      toast(`Failed to load consent records: ${e.message}`, "error");
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 2) loadRecords(recordFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const applyRecordFilters = () => loadRecords(recordFilters);

  const resetRecordFilters = () => {
    const cleared = { clientId: "", definitionId: "", endUserRef: "", status: "" };
    setRecordFilters(cleared);
    loadRecords(cleared);
  };

  // ── Tab 3: Audit History ───────────────────────────────────────────────────
  const [auditClientId, setAuditClientId]   = useState("");
  const [auditUserRef, setAuditUserRef]     = useState("");
  const [auditHistory, setAuditHistory]     = useState([]);
  const [auditLoading, setAuditLoading]     = useState(false);
  const [recordHistoryId, setRecordHistoryId]   = useState(null);
  const [recordHistory, setRecordHistory]       = useState([]);
  const [recordHistoryLoading, setRecordHistoryLoading] = useState(false);

  const loadUserAudit = async () => {
    if (!auditClientId.trim() || !auditUserRef.trim()) {
      toast("Please enter both Client ID and End User Ref.", "warning");
      return;
    }
    setAuditLoading(true);
    try {
      const data = await api.getUserAuditHistory(auditClientId.trim(), auditUserRef.trim());
      setAuditHistory(Array.isArray(data) ? data : data?.history ?? []);
    } catch (e) {
      toast(`Failed to load audit history: ${e.message}`, "error");
    } finally {
      setAuditLoading(false);
    }
  };

  const loadRecordHistory = async (recordId) => {
    if (recordHistoryId === recordId) {
      setRecordHistoryId(null);
      setRecordHistory([]);
      return;
    }
    setRecordHistoryId(recordId);
    setRecordHistoryLoading(true);
    try {
      const data = await api.getConsentHistory(recordId);
      setRecordHistory(Array.isArray(data) ? data : data?.history ?? []);
    } catch (e) {
      toast(`Failed to load record history: ${e.message}`, "error");
    } finally {
      setRecordHistoryLoading(false);
    }
  };

  // ── Shared helpers ─────────────────────────────────────────────────────────
  const clientName = (id) =>
    clients.find((c) => c.id === id)?.name ?? id ?? "—";

  const formatDate = (val) => {
    if (!val) return "—";
    try { return new Date(val).toLocaleString(); } catch (_) { return val; }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} letterSpacing={-0.5}>
            Consent Management
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage clients, consent definitions, records, and audit trails
          </Typography>
        </Box>
      </Box>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: `1px solid ${BORDER}`,
            bgcolor: SURFACE,
            "& .MuiTab-root": { fontSize: 13, fontWeight: 600, textTransform: "none", minWidth: 140 },
            "& .Mui-selected": { color: ACCENT },
            "& .MuiTabs-indicator": { bgcolor: ACCENT },
          }}
        >
          <Tab icon={<Business fontSize="small" />} iconPosition="start" label="Clients" />
          <Tab icon={<Description fontSize="small" />} iconPosition="start" label="Definitions" />
          <Tab icon={<AssignmentTurnedIn fontSize="small" />} iconPosition="start" label="Consent Records" />
          <Tab icon={<ManageSearch fontSize="small" />} iconPosition="start" label="Audit History" />
        </Tabs>

        <Box sx={{ p: 3 }}>

          {/* ══════════════════════════════════════════════════════════════
              TAB 0 — CLIENTS
          ══════════════════════════════════════════════════════════════ */}
          <TabPanel value={tab} index={0}>
            <SectionCard
              title="Registered Clients"
              icon={<Business sx={{ color: ACCENT, fontSize: 20 }} />}
              action={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setClientDialog(true)}
                  sx={{ bgcolor: ACCENT, fontSize: 12 }}
                >
                  New Client
                </Button>
              }
            >
              {clientsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} sx={{ color: ACCENT }} />
                </Box>
              ) : clients.length === 0 ? (
                <EmptyState message="No clients registered yet. Create your first client to get started." />
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: SURFACE }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Client ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Allowed Origins</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clients.map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{ fontFamily: "monospace", bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}
                            >
                              {c.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                              {(c.allowedOrigins ?? []).map((o) => (
                                <Chip key={o} label={o} size="small" sx={{ fontSize: 11, bgcolor: "#eff6ff", color: ACCENT }} />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={c.active === false ? "INACTIVE" : "ACTIVE"}
                              size="small"
                              icon={c.active === false
                                ? <Cancel sx={{ fontSize: "14px !important" }} />
                                : <CheckCircle sx={{ fontSize: "14px !important" }} />}
                              sx={{
                                fontWeight: 700,
                                fontSize: 11,
                                bgcolor: c.active === false ? "#fee2e2" : "#dcfce7",
                                color: c.active === false ? DANGER : SUCCESS,
                                border: `1px solid ${c.active === false ? "#fecaca" : "#bbf7d0"}`,
                              }}
                            />
                          </TableCell>
                          <TableCell>{formatDate(c.createdAt)}</TableCell>
                          <TableCell align="right">
                            {c.active !== false && (
                              <Tooltip title="Deactivate client">
                                <IconButton
                                  size="small"
                                  onClick={() => setConfirmDeactivateClient(c)}
                                >
                                  <Delete fontSize="small" sx={{ color: DANGER }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={loadClients}
                  disabled={clientsLoading}
                  sx={{ color: "text.secondary" }}
                >
                  Refresh
                </Button>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ══════════════════════════════════════════════════════════════
              TAB 1 — DEFINITIONS
          ══════════════════════════════════════════════════════════════ */}
          <TabPanel value={tab} index={1}>

            {/* Client picker */}
            <SectionCard
              title="Select Client"
              icon={<Business sx={{ color: ACCENT, fontSize: 20 }} />}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 280 }}>
                  <InputLabel>Client</InputLabel>
                  <Select
                    label="Client"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <MenuItem value=""><em>— Select a client —</em></MenuItem>
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedClientId && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setDefDialog(true)}
                    sx={{ bgcolor: ACCENT, fontSize: 12 }}
                  >
                    New Definition
                  </Button>
                )}
              </Box>
            </SectionCard>

            {/* Definitions table */}
            {selectedClientId && (
              <SectionCard
                title={`Consent Definitions — ${clientName(selectedClientId)}`}
                icon={<Gavel sx={{ color: ACCENT, fontSize: 20 }} />}
              >
                {defsLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} sx={{ color: ACCENT }} />
                  </Box>
                ) : definitions.length === 0 ? (
                  <EmptyState message="No definitions found for this client." />
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: SURFACE }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          {/* FIX 3: Changed header from "Purpose" to "Description" */}
                          <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                          {/* FIX 4: Added Version column */}
                          <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Legal Basis</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Jurisdiction</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Expiry (days)</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {definitions.map((d) => (
                          <TableRow key={d.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{d.name}</TableCell>
                            {/* FIX 5: Read `d.description` instead of `d.purpose` */}
                            <TableCell sx={{ maxWidth: 200 }}>
                              <Tooltip title={d.description || ""}>
                                <Typography variant="body2" noWrap>{d.description || "—"}</Typography>
                              </Tooltip>
                            </TableCell>
                            {/* FIX 6: Show version value */}
                            <TableCell>
                              <Chip
                                label={d.version || "—"}
                                size="small"
                                sx={{ fontSize: 11, bgcolor: "#f5f3ff", color: "#7c3aed", fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={d.legalBasis || "—"}
                                size="small"
                                sx={{ fontSize: 11, bgcolor: "#eff6ff", color: ACCENT, fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>{d.jurisdiction || "—"}</TableCell>
                            <TableCell>{d.expiryDays ?? "—"}</TableCell>
                            <TableCell>
                              <Chip
                                label={d.active === false ? "INACTIVE" : "ACTIVE"}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 11,
                                  bgcolor: d.active === false ? "#fee2e2" : "#dcfce7",
                                  color: d.active === false ? DANGER : SUCCESS,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {d.active !== false && (
                                <Tooltip title="Deactivate definition">
                                  <IconButton
                                    size="small"
                                    onClick={() => setConfirmDeactivateDef(d)}
                                  >
                                    <Delete fontSize="small" sx={{ color: DANGER }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={() => loadDefinitions(selectedClientId)}
                    disabled={defsLoading}
                    sx={{ color: "text.secondary" }}
                  >
                    Refresh
                  </Button>
                </Box>
              </SectionCard>
            )}
          </TabPanel>

          {/* ══════════════════════════════════════════════════════════════
              TAB 2 — CONSENT RECORDS
          ══════════════════════════════════════════════════════════════ */}
          <TabPanel value={tab} index={2}>

            {/* Filters */}
            <SectionCard
              title="Filters"
              icon={<FilterList sx={{ color: ACCENT, fontSize: 20 }} />}
              action={
                <IconButton size="small" onClick={() => setFiltersOpen((p) => !p)}>
                  {filtersOpen ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              }
            >
              <Collapse in={filtersOpen}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <FormControl size="small">
                    <InputLabel>Client</InputLabel>
                    <Select
                      label="Client"
                      value={recordFilters.clientId}
                      onChange={(e) => setRecordFilters((f) => ({ ...f, clientId: e.target.value }))}
                    >
                      <MenuItem value=""><em>All clients</em></MenuItem>
                      {clients.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    label="Definition ID"
                    value={recordFilters.definitionId}
                    onChange={(e) => setRecordFilters((f) => ({ ...f, definitionId: e.target.value }))}
                  />

                  <TextField
                    size="small"
                    label="End User Ref"
                    value={recordFilters.endUserRef}
                    onChange={(e) => setRecordFilters((f) => ({ ...f, endUserRef: e.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ fontSize: 18, color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={recordFilters.status}
                      onChange={(e) => setRecordFilters((f) => ({ ...f, status: e.target.value }))}
                    >
                      <MenuItem value=""><em>All statuses</em></MenuItem>
                      <MenuItem value="GIVEN">GIVEN</MenuItem>
                      <MenuItem value="WITHDRAWN">WITHDRAWN</MenuItem>
                      <MenuItem value="EXPIRED">EXPIRED</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Search />}
                    onClick={applyRecordFilters}
                    disabled={recordsLoading}
                    sx={{ bgcolor: ACCENT }}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={resetRecordFilters}
                    disabled={recordsLoading}
                    sx={{ color: "text.secondary" }}
                  >
                    Reset
                  </Button>
                </Box>
              </Collapse>
            </SectionCard>

            {/* Records table */}
            <SectionCard
              title={`Consent Records ${records.length > 0 ? `(${records.length})` : ""}`}
              icon={<AssignmentTurnedIn sx={{ color: ACCENT, fontSize: 20 }} />}
            >
              {recordsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} sx={{ color: ACCENT }} />
                </Box>
              ) : records.length === 0 ? (
                <EmptyState message="No consent records found. Adjust filters and try again." />
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: SURFACE }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>End User Ref</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Definition</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Form ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Updated</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>History</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records.map((r) => (
                        <React.Fragment key={r.id}>
                          <TableRow hover>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Person sx={{ fontSize: 16, color: "text.secondary" }} />
                                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 12 }}>
                                  {r.endUserRef}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{clientName(r.clientId)}</TableCell>
                            <TableCell>
                              <Tooltip title={r.consentDefinitionId || ""}>
                                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                                  {r.consentDefinitionId?.slice(0, 8)}…
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                                {r.formId || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell><StatusChip status={r.status} /></TableCell>
                            <TableCell>{formatDate(r.updatedAt ?? r.createdAt)}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="View audit history for this record">
                                <IconButton
                                  size="small"
                                  onClick={() => loadRecordHistory(r.id)}
                                  sx={{ color: recordHistoryId === r.id ? ACCENT : "text.secondary" }}
                                >
                                  {recordHistoryLoading && recordHistoryId === r.id
                                    ? <CircularProgress size={16} />
                                    : <History fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>

                          {/* Inline record history */}
                          {recordHistoryId === r.id && (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ p: 0, bgcolor: "#f8fafc" }}>
                                <Box sx={{ px: 4, py: 2 }}>
                                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                    Audit Trail — {r.endUserRef}
                                  </Typography>
                                  {recordHistoryLoading ? (
                                    <CircularProgress size={16} sx={{ ml: 2, color: ACCENT }} />
                                  ) : recordHistory.length === 0 ? (
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                      No history entries.
                                    </Typography>
                                  ) : (
                                    <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                      {recordHistory.map((h, i) => (
                                        <Box
                                          key={i}
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            py: 0.75,
                                            borderBottom: i < recordHistory.length - 1 ? `1px solid ${BORDER}` : "none",
                                          }}
                                        >
                                          <StatusChip status={h.status} />
                                          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                                            {formatDate(h.changedAt ?? h.createdAt)}
                                          </Typography>
                                          {h.formId && (
                                            <Typography variant="caption" color="text.secondary">
                                              form: {h.formId}
                                            </Typography>
                                          )}
                                          {h.ipAddress && (
                                            <Typography variant="caption" color="text.secondary">
                                              ip: {h.ipAddress}
                                            </Typography>
                                          )}
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </SectionCard>
          </TabPanel>

          {/* ══════════════════════════════════════════════════════════════
              TAB 3 — AUDIT HISTORY
          ══════════════════════════════════════════════════════════════ */}
          <TabPanel value={tab} index={3}>

            <SectionCard
              title="Full User Audit History"
              icon={<Person sx={{ color: ACCENT, fontSize: 20 }} />}
            >
              <Typography variant="body2" color="text.secondary" mb={2}>
                View the complete consent lifecycle for a specific end user across a client.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 1 }}>
                <FormControl size="small" sx={{ minWidth: 240 }}>
                  <InputLabel>Client</InputLabel>
                  <Select
                    label="Client"
                    value={auditClientId}
                    onChange={(e) => setAuditClientId(e.target.value)}
                  >
                    <MenuItem value=""><em>— Select client —</em></MenuItem>
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="End User Ref"
                  placeholder="e.g. user-ref-abc123"
                  value={auditUserRef}
                  onChange={(e) => setAuditUserRef(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadUserAudit()}
                  sx={{ minWidth: 260 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ fontSize: 18, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="contained"
                  size="small"
                  startIcon={auditLoading ? <CircularProgress size={16} color="inherit" /> : <Search />}
                  onClick={loadUserAudit}
                  disabled={auditLoading || !auditClientId || !auditUserRef.trim()}
                  sx={{ bgcolor: ACCENT }}
                >
                  {auditLoading ? "Loading…" : "Fetch History"}
                </Button>
              </Box>
            </SectionCard>

            {auditHistory.length > 0 && (
              <SectionCard
                title={`Audit Trail — ${auditUserRef} (${auditHistory.length} entries)`}
                icon={<History sx={{ color: ACCENT, fontSize: 20 }} />}
              >
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: SURFACE }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Definition</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Form ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Changed At</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Origin</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditHistory.map((h, i) => (
                        <TableRow key={i} hover>
                          <TableCell>
                            <Tooltip title={h.consentDefinitionId || h.definitionId || ""}>
                              <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                                {(h.consentDefinitionId ?? h.definitionId ?? "—").slice(0, 8)}…
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                              {h.formId || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell><StatusChip status={h.status} /></TableCell>
                          <TableCell>{formatDate(h.changedAt ?? h.createdAt)}</TableCell>
                          <TableCell>{h.ipAddress || "—"}</TableCell>
                          <TableCell>
                            {h.origin ? (
                              <Chip
                                label={h.origin}
                                size="small"
                                icon={<Domain sx={{ fontSize: "14px !important" }} />}
                                sx={{ fontSize: 11, bgcolor: "#f1f5f9" }}
                              />
                            ) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SectionCard>
            )}
          </TabPanel>

        </Box>
      </Paper>

      {/* ══════════════════════════════════════════════════════════════════════
          DIALOGS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Create Client Dialog */}
      <Dialog
        open={clientDialog}
        onClose={() => setClientDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${BORDER}` }}>
          Register New Client
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "grid", gap: 2.5, mt: 1 }}>
            <TextField
              size="small"
              label="Client Name *"
              fullWidth
              value={clientForm.name}
              onChange={(e) => setClientForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Acme Corp"
            />
            <TextField
              size="small"
              label="Allowed Origins"
              fullWidth
              value={clientForm.allowedOrigins}
              onChange={(e) => setClientForm((f) => ({ ...f, allowedOrigins: e.target.value }))}
              placeholder="https://acmecorp.com, https://hr.acmecorp.com"
              helperText="Comma-separated. Consent recording requests from other origins will be blocked."
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setClientDialog(false)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateClient}
            disabled={savingClient || !clientForm.name.trim()}
            sx={{ bgcolor: ACCENT }}
          >
            {savingClient ? "Creating…" : "Create Client"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Definition Dialog */}
      <Dialog
        open={defDialog}
        onClose={() => setDefDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${BORDER}` }}>
          New Consent Definition
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "grid", gap: 2.5, mt: 1 }}>
            <TextField
              size="small"
              label="Definition Name *"
              fullWidth
              value={defForm.name}
              onChange={(e) => setDefForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Marketing Email Consent v2"
            />

            {/* FIX 7: Renamed label from "Purpose" → "Description", binds to `description` */}
            <TextField
              size="small"
              label="Description"
              fullWidth
              value={defForm.description}
              onChange={(e) => setDefForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. I agree to receive promotional emails from Acme Corp"
            />

            {/* FIX 8: NEW Version field — required by the API */}
            <TextField
              size="small"
              label="Version *"
              fullWidth
              value={defForm.version}
              onChange={(e) => setDefForm((f) => ({ ...f, version: e.target.value }))}
              placeholder="e.g. 1.0"
              helperText="Version identifier for this consent definition (required)."
            />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <FormControl size="small">
                <InputLabel>Legal Basis *</InputLabel>
                <Select
                  label="Legal Basis *"
                  value={defForm.legalBasis}
                  onChange={(e) => setDefForm((f) => ({ ...f, legalBasis: e.target.value }))}
                >
                  {LEGAL_BASIS_OPTIONS.map((lb) => (
                    <MenuItem key={lb} value={lb}>{lb}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Jurisdiction"
                value={defForm.jurisdiction}
                onChange={(e) => setDefForm((f) => ({ ...f, jurisdiction: e.target.value }))}
                placeholder="e.g. GDPR, CCPA"
              />
            </Box>
            <TextField
              size="small"
              label="Consent Text"
              fullWidth
              multiline
              rows={3}
              value={defForm.consentText}
              onChange={(e) => setDefForm((f) => ({ ...f, consentText: e.target.value }))}
              placeholder="I agree to receive marketing communications from…"
            />
            <TextField
              size="small"
              label="Expiry (days)"
              type="number"
              fullWidth
              value={defForm.expiryDays}
              onChange={(e) => setDefForm((f) => ({ ...f, expiryDays: e.target.value }))}
              placeholder="e.g. 365  (leave blank for no expiry)"
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDefDialog(false)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          {/* FIX 9: Also disable submit when version is empty */}
          <Button
            variant="contained"
            onClick={handleCreateDefinition}
            disabled={savingDef || !defForm.name.trim() || !defForm.version.trim()}
            sx={{ bgcolor: ACCENT }}
          >
            {savingDef ? "Creating…" : "Create Definition"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Deactivate Client */}
      <Dialog
        open={!!confirmDeactivateClient}
        onClose={() => setConfirmDeactivateClient(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Deactivate Client?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 1 }}>
            Deactivating <strong>{confirmDeactivateClient?.name}</strong> will immediately block all
            consent recording from its registered domains. This cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDeactivateClient(null)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleDeactivateClient(confirmDeactivateClient)}
            disabled={!!deactivatingClient}
            sx={{ bgcolor: DANGER, "&:hover": { bgcolor: "#b91c1c" } }}
          >
            {deactivatingClient ? "Deactivating…" : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Deactivate Definition */}
      <Dialog
        open={!!confirmDeactivateDef}
        onClose={() => setConfirmDeactivateDef(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Deactivate Definition?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 1 }}>
            Deactivating <strong>{confirmDeactivateDef?.name}</strong> will prevent new consents from
            being recorded against it. Existing records are preserved.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDeactivateDef(null)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleDeactivateDefinition(confirmDeactivateDef)}
            disabled={!!deactivatingDef}
            sx={{ bgcolor: DANGER, "&:hover": { bgcolor: "#b91c1c" } }}
          >
            {deactivatingDef ? "Deactivating…" : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}