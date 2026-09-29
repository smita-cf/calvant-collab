import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Users,
    FileText,
    ClipboardList,
    Search,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    History,
    Filter,
    X,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Eye,
    RotateCcw,
} from "lucide-react";
import { useUser } from "../../../hooks/useUser";
import consentService from "../service/consentApi";

// ── Constants ─────────────────────────────────────────────────────────────────
const ALLOWED_ROLES = ["root", "dpo"];

const STATUS_CONFIG = {
    GIVEN: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle2, dot: "bg-green-500" },
    WITHDRAWN: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, dot: "bg-red-500" },
    EXPIRED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock, dot: "bg-amber-500" },
};

const EMPTY_FILTERS = { clientId: "", definitionId: "", endUserRef: "", status: "" };

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (val) => {
    if (!val) return "—";
    try { return new Date(val).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return val; }
};

const userHasAccess = (user) => {
    if (!user) return false;
    const roles = Array.isArray(user.role) ? user.role : [user.role];
    return roles.some((r) => ALLOWED_ROLES.includes(r));
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, loading }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                {loading ? (
                    <div className="h-7 w-12 bg-gray-100 rounded animate-pulse mt-1" />
                ) : (
                    <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
                )}
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {status || "—"}
        </span>
    );
}

function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
            <div>
                <h2 className="text-base font-semibold text-gray-800">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

function EmptyState({ message, icon: Icon = ClipboardList }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Icon size={22} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
}

function Spinner() {
    return (
        <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

// ── Inline history row ────────────────────────────────────────────────────────
function HistoryRow({ entry, index, total }) {
    return (
        <div className={`flex items-center gap-4 py-2.5 text-sm ${index < total - 1 ? "border-b border-gray-50" : ""}`}>
            <StatusBadge status={entry.status} />
            <span className="text-gray-500 text-xs font-mono flex-shrink-0">
                {formatDate(entry.changedAt ?? entry.createdAt)}
            </span>
            {entry.formId && <span className="text-gray-400 text-xs">form: {entry.formId}</span>}
            {entry.ipAddress && <span className="text-gray-400 text-xs">ip: {entry.ipAddress}</span>}
            {entry.origin && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{entry.origin}</span>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ConsentDashboard() {
    const user = useUser();
    const history = useHistory();
    const token = sessionStorage.getItem("token") || "";

    // Access guard
    useEffect(() => {
        if (user && !userHasAccess(user)) history.replace("/");
    }, [user, history]);

    // ── Tab state ─────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("records"); // "records" | "audit"

    // ── Clients (needed for filter dropdowns) ────────────────────────────────
    const [clients, setClients] = useState([]);

    const loadClients = useCallback(async () => {
        try {
            const data = await consentService.listClients(token);
            setClients(Array.isArray(data) ? data : data?.clients ?? []);
        } catch { /* silent — clients are optional for filter labels */ }
    }, []);

    useEffect(() => { loadClients(); }, [loadClients]);

    const clientName = (id) => clients.find((c) => c.id === id)?.name ?? id ?? "—";

    // ── Consent Records tab ──────────────────────────────────────────────────
    const [records, setRecords] = useState([]);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [recordFilters, setRecordFilters] = useState(EMPTY_FILTERS);
    const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [expandedRecordId, setExpandedRecordId] = useState(null);
    const [recordHistory, setRecordHistory] = useState([]);
    const [recordHistoryLoading, setRecordHistoryLoading] = useState(false);
    const [definitionDescriptions, setDefinitionDescriptions] = useState({});

    const loadRecords = useCallback(async () => {
        setRecordsLoading(true);
        try {
            // First ensure clients are loaded
            let clientList = clients;
            if (clientList.length === 0) {
                const data = await consentService.listClients(token);
                clientList = Array.isArray(data) ? data : data?.clients ?? [];
                setClients(clientList);
            }
            // Fetch consents for each client and merge
            const activeClients = clientList.filter((c) => c.active !== false);
            const results = await Promise.all(
                activeClients.map((c) =>
                    consentService.listConsents(token, c.id).catch(() => null)
                )
            );
            const merged = results.flatMap((r) =>
                Array.isArray(r) ? r : r?.consents ?? []
            );
            setRecords(merged);
        } catch (e) {
            console.error("Failed to load consent records:", e);
        } finally {
            setRecordsLoading(false);
        }
    }, [token, clients]);

    useEffect(() => {
        if (activeTab === "records") loadRecords();
    }, [activeTab, loadRecords]);

    const applyFilters = () => setActiveFilters({ ...recordFilters });
    const resetFilters = () => { setRecordFilters(EMPTY_FILTERS); setActiveFilters(EMPTY_FILTERS); };

    const filteredRecords = records.filter((r) => {
        if (activeFilters.clientId && r.clientId !== activeFilters.clientId) return false;
        if (activeFilters.definitionId && !(r.consentDefinitionId ?? "").toLowerCase().includes(activeFilters.definitionId.toLowerCase())) return false;
        if (activeFilters.endUserRef && !(r.endUserRef ?? "").toLowerCase().includes(activeFilters.endUserRef.toLowerCase())) return false;
        if (activeFilters.status && r.status !== activeFilters.status) return false;
        return true;
    });

    const toggleRecordHistory = async (recordId) => {
        if (expandedRecordId === recordId) { setExpandedRecordId(null); setRecordHistory([]); return; }
        setExpandedRecordId(recordId);
        setRecordHistoryLoading(true);
        try {
            const data = await consentService.getConsentHistory(token, recordId);
            setRecordHistory(Array.isArray(data) ? data : data?.history ?? []);
        } catch { setRecordHistory([]); }
        finally { setRecordHistoryLoading(false); }
    };

    // ── Audit History tab ────────────────────────────────────────────────────
    const [auditClientId, setAuditClientId] = useState("");
    const [auditUserRef, setAuditUserRef] = useState("");
    const [auditHistory, setAuditHistory] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditFetched, setAuditFetched] = useState(false);

    const fetchUserAudit = async () => {
        if (!auditClientId || !auditUserRef.trim()) return;
        setAuditLoading(true);
        setAuditFetched(false);
        try {
            const data = await consentService.getUserAuditHistory(
                token, auditClientId, auditUserRef.trim()
            );
            const history = Array.isArray(data) ? data : data?.history ?? [];
            setAuditHistory(history);
            setAuditFetched(true);

            // Bulk-fetch descriptions for all unique definition IDs
            const uniqueDefIds = [
                ...new Set(
                    history
                        .map((h) => h.consentDefinitionId ?? h.definitionId)
                        .filter(Boolean)
                ),
            ];

            const entries = await Promise.all(
                uniqueDefIds.map(async (defId) => {
                    const def = await consentService.listDefinitionsbyId(token, auditClientId, defId);
                    return [defId, def?.description ?? defId]; // fallback to ID if no description
                })
            );
            setDefinitionDescriptions(Object.fromEntries(entries));

        } catch {
            setAuditHistory([]);
            setAuditFetched(true);
        } finally {
            setAuditLoading(false);
        }
    };

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = {
        total: records.length,
        given: records.filter((r) => r.status === "GIVEN").length,
        withdrawn: records.filter((r) => r.status === "WITHDRAWN").length,
        expired: records.filter((r) => r.status === "EXPIRED").length,
    };

    if (!user || !userHasAccess(user)) return null;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f8fafc] px-4 sm:px-6 lg:px-10 py-8">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-md">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Consent Management</h1>
                        <p className="text-sm text-gray-500">Track consent records and full audit trails</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Stats ───────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={ClipboardList} label="Total Records" value={stats.total} color="bg-[#667eea]" loading={recordsLoading} />
                <StatCard icon={CheckCircle2} label="Given" value={stats.given} color="bg-green-500" loading={recordsLoading} />
                <StatCard icon={XCircle} label="Withdrawn" value={stats.withdrawn} color="bg-red-500" loading={recordsLoading} />
                <StatCard icon={Clock} label="Expired" value={stats.expired} color="bg-amber-500" loading={recordsLoading} />
            </div>

            {/* ── Tabs ────────────────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm mb-6 w-fit">
                {[
                    { key: "records", label: "Consent Records", icon: ClipboardList },
                    { key: "audit", label: "Audit History", icon: History },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === key
                                ? "bg-[#667eea] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
          TAB: CONSENT RECORDS
      ══════════════════════════════════════════════════════════════════ */}
            <AnimatePresence mode="wait">
                {activeTab === "records" && (
                    <motion.div key="records" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

                        {/* Filters card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
                            <button
                                onClick={() => setFiltersOpen((p) => !p)}
                                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Filter size={15} className="text-[#667eea]" />
                                    Filters
                                    {Object.values(activeFilters).some(Boolean) && (
                                        <span className="bg-[#667eea] text-white text-xs px-2 py-0.5 rounded-full">Active</span>
                                    )}
                                </span>
                                {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            <AnimatePresence>
                                {filtersOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 border-t border-gray-50">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">

                                                {/* Client filter */}
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Client</label>
                                                    <select
                                                        value={recordFilters.clientId}
                                                        onChange={(e) => setRecordFilters((f) => ({ ...f, clientId: e.target.value }))}
                                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#667eea]/30 focus:border-[#667eea] bg-white"
                                                    >
                                                        <option value="">All clients</option>
                                                        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>

                                                {/* Definition ID filter */}
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Definition ID</label>
                                                    <input
                                                        type="text"
                                                        value={recordFilters.definitionId}
                                                        onChange={(e) => setRecordFilters((f) => ({ ...f, definitionId: e.target.value }))}
                                                        placeholder="Search definition..."
                                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#667eea]/30 focus:border-[#667eea]"
                                                    />
                                                </div>

                                                {/* End User Ref filter */}
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">End User Ref</label>
                                                    <input
                                                        type="text"
                                                        value={recordFilters.endUserRef}
                                                        onChange={(e) => setRecordFilters((f) => ({ ...f, endUserRef: e.target.value }))}
                                                        placeholder="Search user ref..."
                                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#667eea]/30 focus:border-[#667eea]"
                                                    />
                                                </div>

                                                {/* Status filter */}
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                                                    <select
                                                        value={recordFilters.status}
                                                        onChange={(e) => setRecordFilters((f) => ({ ...f, status: e.target.value }))}
                                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#667eea]/30 focus:border-[#667eea] bg-white"
                                                    >
                                                        <option value="">All statuses</option>
                                                        <option value="GIVEN">GIVEN</option>
                                                        <option value="WITHDRAWN">WITHDRAWN</option>
                                                        <option value="EXPIRED">EXPIRED</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={applyFilters}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#667eea] text-white text-sm font-medium rounded-lg hover:bg-[#5a6fd6] transition-colors shadow-sm"
                                                >
                                                    <Search size={14} />
                                                    Apply Filters
                                                </button>
                                                <button
                                                    onClick={resetFilters}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <RotateCcw size={14} />
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Records table card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                <div className="flex items-center gap-2">
                                    <ClipboardList size={16} className="text-[#667eea]" />
                                    <span className="text-sm font-semibold text-gray-800">
                                        Consent Records
                                        {filteredRecords.length > 0 && (
                                            <span className="ml-2 text-xs text-gray-400 font-normal">
                                                {filteredRecords.length}{filteredRecords.length !== records.length ? ` of ${records.length}` : ""} records
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <button
                                    onClick={loadRecords}
                                    disabled={recordsLoading}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#667eea] transition-colors"
                                >
                                    <RefreshCw size={13} className={recordsLoading ? "animate-spin" : ""} />
                                    Refresh
                                </button>
                            </div>

                            {recordsLoading ? (
                                <Spinner />
                            ) : filteredRecords.length === 0 ? (
                                <EmptyState
                                    message={records.length === 0 ? "No consent records found." : "No records match the applied filters."}
                                    icon={ClipboardList}
                                />
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {filteredRecords.map((r) => (
                                        <div key={r.id}>
                                            {/* Record row */}
                                            <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors flex-wrap">
                                                {/* User ref */}
                                                <div className="flex items-center gap-2 min-w-[160px] flex-1">
                                                    <div className="w-7 h-7 rounded-full bg-[#667eea]/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[#667eea] text-xs font-bold">
                                                            {(r.endUserRef || "U")[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-mono text-gray-700 truncate">{r.endUserRef}</span>
                                                </div>

                                                {/* Client */}
                                                <span className="text-sm text-gray-500 min-w-[100px] hidden sm:block">
                                                    {clientName(r.clientId)}
                                                </span>

                                                {/* Definition ID */}
                                                <span
                                                    title={r.consentDefinitionId}
                                                    className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded hidden md:block"
                                                >
                                                    {r.consentDefinitionId?.slice(0, 8)}…
                                                </span>

                                                {/* Form ID */}
                                                <span className="text-xs text-gray-400 hidden lg:block">
                                                    {r.formId || "—"}
                                                </span>

                                                {/* Status */}
                                                <StatusBadge status={r.status} />

                                                {/* Updated */}
                                                <span className="text-xs text-gray-400 hidden xl:block flex-shrink-0">
                                                    {formatDate(r.updatedAt ?? r.createdAt)}
                                                </span>

                                                {/* History toggle */}
                                                <button
                                                    onClick={() => toggleRecordHistory(r.id)}
                                                    title="View audit trail for this record"
                                                    className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 flex-shrink-0 ${expandedRecordId === r.id
                                                            ? "bg-[#667eea] text-white border-[#667eea]"
                                                            : "text-gray-500 border-gray-200 hover:border-[#667eea] hover:text-[#667eea]"
                                                        }`}
                                                >
                                                    <History size={13} />
                                                    Trail
                                                </button>
                                            </div>

                                            {/* Inline history expand */}
                                            <AnimatePresence>
                                                {expandedRecordId === r.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="bg-[#f8fafc] border-t border-gray-100 px-5 py-4 ml-4 mr-4 mb-2 rounded-xl">
                                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                                                                Audit Trail — {r.endUserRef}
                                                            </p>
                                                            {recordHistoryLoading ? (
                                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                                    <div className="w-4 h-4 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
                                                                    Loading history…
                                                                </div>
                                                            ) : recordHistory.length === 0 ? (
                                                                <p className="text-sm text-gray-400">No history entries found.</p>
                                                            ) : (
                                                                recordHistory.map((h, i) => (
                                                                    <HistoryRow key={i} entry={h} index={i} total={recordHistory.length} />
                                                                ))
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════════════════════════
            TAB: AUDIT HISTORY
        ══════════════════════════════════════════════════════════════ */}
                {activeTab === "audit" && (
                    <motion.div key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

                        {/* Search card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                            <p className="text-sm text-gray-500 mb-4">
                                View the complete consent lifecycle for a specific end user across a client.
                            </p>
                            <div className="flex flex-wrap gap-3 items-end">
                                {/* Client select */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Client</label>
                                    <select
                                        value={auditClientId}
                                        onChange={(e) => setAuditClientId(e.target.value)}
                                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#667eea]/30 focus:border-[#667eea] bg-white min-w-[200px]"
                                    >
                                        <option value="">— Select client —</option>
                                        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                {/* End user ref */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">End User Ref</label>
                                    <input
                                        type="text"
                                        value={auditUserRef}
                                        onChange={(e) => setAuditUserRef(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && fetchUserAudit()}
                                        placeholder="e.g. user-ref-abc123"
                                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#667eea]/30 focus:border-[#667eea] min-w-[240px]"
                                    />
                                </div>

                                <button
                                    onClick={fetchUserAudit}
                                    disabled={auditLoading || !auditClientId || !auditUserRef.trim()}
                                    className="flex items-center gap-2 px-5 py-2 bg-[#667eea] text-white text-sm font-medium rounded-lg hover:bg-[#5a6fd6] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {auditLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Search size={14} />
                                    )}
                                    {auditLoading ? "Loading…" : "Fetch History"}
                                </button>
                            </div>
                        </div>

                        {/* Audit results */}
                        {auditFetched && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                                    <History size={16} className="text-[#667eea]" />
                                    <span className="text-sm font-semibold text-gray-800">
                                        Audit Trail — {auditUserRef}
                                        <span className="ml-2 text-xs font-normal text-gray-400">{auditHistory.length} entries</span>
                                    </span>
                                </div>

                                {auditHistory.length === 0 ? (
                                    <EmptyState message="No audit history found for this user and client." icon={History} />
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {auditHistory.map((h, i) => (
                                            <div key={i} className="px-5 py-3.5 hover:bg-gray-50/60 transition-colors flex flex-wrap items-center gap-4">
                                                <StatusBadge status={h.status} />
                                                <span className="text-xs font-mono text-gray-500 flex-shrink-0">
                                                    {formatDate(h.changedAt ?? h.createdAt)}
                                                </span>
                                                <span
                                                    title={h.consentDefinitionId ?? h.definitionId}  // full ID still visible on hover
                                                    className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded hidden sm:block max-w-[200px] truncate"
                                                >
                                                    {definitionDescriptions[h.consentDefinitionId ?? h.definitionId]}
                                                </span>
                                                {h.formId && (
                                                    <span className="text-xs text-gray-400">form: {h.formId}</span>
                                                )}
                                                {h.ipAddress && (
                                                    <span className="text-xs text-gray-400">ip: {h.ipAddress}</span>
                                                )}
                                                {h.origin && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{h.origin}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}