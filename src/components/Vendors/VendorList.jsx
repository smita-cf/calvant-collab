import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { captureActivity, ACTIONS } from "../../services/activities";

import {
    Box,
    Button,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Stack,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorefrontIcon from "@mui/icons-material/Storefront";

const TPRM_BASE = "https://api.calvant.com/tprm-service/api/tprm/vendors";

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Inline edit state
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [savingId, setSavingId] = useState(null);

    // Delete dialog state
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [confirmText, setConfirmText] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();

    // Auth helpers
    const token = localStorage.getItem("token");
    const myObject = JSON.parse(localStorage.getItem("myObject") || "{}");
    const organizationId = myObject?.organization || null;

    const decoded = token ? jwtDecode(token) : null;
    const loggedInRole = Array.isArray(decoded?.role) ? decoded.role[0] : decoded?.role;
    const isRoot = loggedInRole === "root";
    const isSuperAdmin = loggedInRole === "super_admin";

    const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    // ── Fetch ──────────────────────────────────────────────────────────────────

    const fetchVendors = async () => {
        setLoading(true);
        setError("");
        try {
            // super_admin sees all vendors (no org filter); root sees only their org
            const params = isSuperAdmin ? {} : { organization: organizationId };
            const res = await axios.get(TPRM_BASE, {
                headers: authHeaders,
                params,
            });
            const data = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
            setVendors(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load vendors.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    // ── Inline Edit ────────────────────────────────────────────────────────────

    const handleStartEdit = (vendor) => {
        setEditingId(vendor.id || vendor._id);
        setEditName(vendor.vendorName || vendor.name || "");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const handleSave = async (vendor) => {
        if (!editName.trim()) return;
        const id = vendor.id || vendor._id;
        setSavingId(id);
        try {
            await axios.put(
                `${TPRM_BASE}/${id}`,
                { ...vendor, vendorName: editName.trim() },
                { headers: authHeaders }
            );
            setVendors((prev) =>
                prev.map((v) =>
                    (v.id || v._id) === id ? { ...v, vendorName: editName.trim() } : v
                )
            );
            setSuccess(`Vendor "${editName.trim()}" updated.`);
            captureActivity({ action: ACTIONS.UPDATE, item: [{ name: editName.trim() }] });
            setEditingId(null);
            setEditName("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update vendor.");
        } finally {
            setSavingId(null);
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────

    const handleOpenDelete = (vendor) => {
        setDeleteTarget(vendor);
        setConfirmText("");
        setOpenDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (confirmText.trim().toLowerCase() !== "confirm") return;
        const id = deleteTarget?.id || deleteTarget?._id;
        setDeletingId(id);
        try {
            await axios.delete(`${TPRM_BASE}/${id}`, { headers: authHeaders });
            setVendors((prev) => prev.filter((v) => (v.id || v._id) !== id));
            setSuccess(`Vendor "${deleteTarget?.vendorName || deleteTarget?.name}" deleted.`);
            captureActivity({ action: ACTIONS.DELETE, item: [{ name: deleteTarget?.vendorName }] });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete vendor.");
        } finally {
            setDeletingId(null);
            setOpenDelete(false);
            setConfirmText("");
            setDeleteTarget(null);
        }
    };

    // ── Filter & Pagination ────────────────────────────────────────────────────

    const filtered = vendors.filter((v) => {
        const name = (v.vendorName || v.name || "").toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const visibleRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // ── Render ──────────────────────────────────────────────────────────────────

    return (
        <Box sx={{ p: 2 }}>
            {/* Header */}
            <Stack direction="row" spacing={2} mb={2} alignItems="center">
                <StorefrontIcon color="action" />
                <Typography variant="h5">Vendor Management</Typography>
                <Box sx={{ flexGrow: 1 }}>
                    <TextField
                        placeholder="Search vendors..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                    />
                </Box>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchVendors}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
                {isRoot && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/vendors/create")}
                    >
                        Add Vendor
                    </Button>
                )}
            </Stack>

            {success && (
                <Alert severity="success" sx={{ mb: 1 }} onClose={() => setSuccess("")}>
                    {success}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Table */}
            <Paper>
                <TableContainer sx={{ maxHeight: "70vh" }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Vendor Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Point of Contact</TableCell>
                                {isRoot && (
                                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                                        Actions
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={isRoot ? 3 : 2} align="center">
                                        <CircularProgress size={28} sx={{ my: 2 }} />
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isRoot ? 3 : 2} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                            No vendors found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleRows.map((vendor) => {
                                    const id = vendor.id || vendor._id;
                                    const isEditing = editingId === id;
                                    const displayName = vendor.vendorName || vendor.name || "-";

                                    return (
                                        <TableRow
                                            key={id}
                                            sx={{
                                                backgroundColor: isEditing ? "#f0f7ff" : "inherit",
                                                "&:hover": {
                                                    backgroundColor: isEditing ? "#e8f2ff" : "#f9fafb",
                                                },
                                            }}
                                        >
                                            {/* Vendor Name */}
                                            <TableCell>
                                                {isRoot && isEditing ? (
                                                    <TextField
                                                        size="small"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        sx={{ minWidth: 180 }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <StorefrontIcon fontSize="small" color="action" />
                                                        <Typography variant="subtitle2">{displayName}</Typography>
                                                    </Box>
                                                )}
                                            </TableCell>

                                            {/* Organization */}
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {vendor.poc || "-"}
                                                </Typography>
                                            </TableCell>

                                            {/* Actions — root only */}
                                            {isRoot && (
                                                <TableCell align="right">
                                                    {isEditing ? (
                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                startIcon={savingId === id ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                                                                disabled={savingId === id}
                                                                onClick={() => handleSave(vendor)}
                                                            >
                                                                {savingId === id ? "Saving..." : "Save"}
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                startIcon={<CancelIcon />}
                                                                onClick={handleCancelEdit}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Stack>
                                                    ) : (
                                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                            <Tooltip title="Edit vendor">
                                                                <IconButton
                                                                    color="primary"
                                                                    size="small"
                                                                    onClick={() => handleStartEdit(vendor)}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete vendor">
                                                                <IconButton
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() => handleOpenDelete(vendor)}
                                                                    disabled={deletingId === id}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(e, p) => setPage(p)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(+e.target.value);
                        setPage(0);
                    }}
                />
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDelete}
                onClose={() => { setOpenDelete(false); setConfirmText(""); }}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Are you sure you want to delete{" "}
                        <strong>{deleteTarget?.vendorName || deleteTarget?.name}</strong>? This action{" "}
                        <strong>cannot be undone</strong>.
                    </DialogContentText>
                    <DialogContentText sx={{ mb: 1 }}>
                        Type <strong>confirm</strong> to proceed:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        placeholder="confirm"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleConfirmDelete()}
                        error={confirmText.length > 0 && confirmText.trim().toLowerCase() !== "confirm"}
                        helperText={
                            confirmText.length > 0 && confirmText.trim().toLowerCase() !== "confirm"
                                ? 'Please type "confirm" exactly'
                                : ""
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenDelete(false); setConfirmText(""); }}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        disabled={confirmText.trim().toLowerCase() !== "confirm" || !!deletingId}
                        onClick={handleConfirmDelete}
                    >
                        {deletingId ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VendorList;