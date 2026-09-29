"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/modules/admin/api/adminAxios";

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
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import RefreshIcon from "@mui/icons-material/Refresh";
import BusinessIcon from "@mui/icons-material/Business";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

const MAX_MANAGERS = 3;

export default function AssignOrgsPage() {
  const router = useRouter();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isSuperAdmin = user?.role?.includes("super_admin");
  const isRoot = user?.role?.includes("root");

  // Only partner root or super_admin should access this
  const canAccess = isSuperAdmin || isRoot;

  // ── State ─────────────────────────────────────────────────────────────────
  const [childOrgs, setChildOrgs] = useState([]); // ACTIVE child orgs
  const [allUsers, setAllUsers] = useState([]); // users in partner org
  const [managersMap, setManagersMap] = useState({}); // orgId → User[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Assign dialog
  const [assignDialog, setAssignDialog] = useState({ open: false, org: null });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [assigning, setAssigning] = useState(false);

  // Remove confirm
  const [removeDialog, setRemoveDialog] = useState({
    open: false,
    orgId: null,
    userId: null,
    userName: "",
  });
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!canAccess) return;
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      // Child orgs this root can manage
      const { data: orgs } = await api.get(
        "https://api.calvant.com/user-service/api/org-managers/my-orgs",
      );
      const activeOrgs = (Array.isArray(orgs) ? orgs : []).filter(
        (o) => o.status === "ACTIVE" || o.status == null,
      );
      setChildOrgs(activeOrgs);

      // Users in the partner org (to assign from)
      const organization = user?.organization;
      const { data: users } = await api.get(
        `https://api.calvant.com/user-service/api/users?organization=${organization}`,
      );
      // Exclude root and super_admin from assignable list
      const assignable = (Array.isArray(users) ? users : []).filter(
        (u) => !u.role?.includes("super_admin"),
      );
      setAllUsers(assignable);

      // For each active child org, fetch current managers
      const managerEntries = await Promise.all(
        activeOrgs.map(async (org) => {
          try {
            const { data } = await api.get(
              `https://api.calvant.com/user-service/api/org-managers/${org.id}/managers`,
            );
            return [org.id, Array.isArray(data) ? data : []];
          } catch {
            return [org.id, []];
          }
        }),
      );
      setManagersMap(Object.fromEntries(managerEntries));
    } catch (err) {
      setError("Failed to load data. " + (err.response?.data || ""));
    } finally {
      setLoading(false);
    }
  };

  // ── Assign dialog ─────────────────────────────────────────────────────────
  const openAssignDialog = (org) => {
    const currentManagers = managersMap[org.id] || [];
    const currentIds = currentManagers.map((u) => u.id);
    setSelectedUsers(currentIds);
    setAssignDialog({ open: true, org });
    setSuccessMsg("");
  };

  const closeAssignDialog = () => {
    setAssignDialog({ open: false, org: null });
    setSelectedUsers([]);
  };

  const handleAssign = async () => {
    const { org } = assignDialog;
    const currentIds = (managersMap[org.id] || []).map((u) => u.id);
    const newlyAdded = selectedUsers.filter((id) => !currentIds.includes(id));

    if (newlyAdded.length === 0) {
      closeAssignDialog();
      return;
    }

    setAssigning(true);
    try {
      await api.post(
        `https://api.calvant.com/user-service/api/org-managers/${org.id}/assign`,
        { userIds: newlyAdded },
      );
      setSuccessMsg(`Managers assigned to "${org.name}" successfully.`);
      closeAssignDialog();
      fetchAll();
    } catch (err) {
      setError(err.response?.data || "Failed to assign managers.");
      setAssigning(false);
    }
  };

  // ── Remove ────────────────────────────────────────────────────────────────
  const openRemoveDialog = (orgId, userId, userName) => {
    setRemoveDialog({ open: true, orgId, userId, userName });
    setSuccessMsg("");
  };

  const handleRemove = async () => {
    const { orgId, userId } = removeDialog;
    setRemoving(true);
    try {
      await api.delete(`https://api.calvant.com/user-service/api/org-managers/${orgId}/remove/${userId}`);
      setSuccessMsg("Manager removed successfully.");
      setRemoveDialog({ open: false, orgId: null, userId: null, userName: "" });
      fetchAll();
    } catch (err) {
      setError(err.response?.data || "Failed to remove manager.");
    } finally {
      setRemoving(false);
    }
  };

  // ── Available slots ───────────────────────────────────────────────────────
  const slotsLeft = (orgId) => {
    const used = (managersMap[orgId] || []).length;
    return MAX_MANAGERS - used;
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!canAccess) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <Alert severity="error">
          Access denied. Partner root or Super Admin only.
        </Alert>
        <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/dashboard")}>
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Assign Org Managers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Delegate access to child organizations for your team. Each client
            org can have up to <strong>{MAX_MANAGERS} managers</strong>.
          </Typography>
        </Box>
        <Tooltip title="Reload">
          <IconButton onClick={fetchAll}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMsg("")}
        >
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : childOrgs.length === 0 ? (
        <Paper
          elevation={2}
          sx={{ p: 6, textAlign: "center", borderRadius: 2 }}
        >
          <BusinessIcon sx={{ fontSize: 52, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No active child organizations found.
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
            Child organizations appear here once they are approved by super
            admin.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {childOrgs.map((org) => {
            const managers = managersMap[org.id] || [];
            const slots = slotsLeft(org.id);
            const isFull = slots <= 0;

            return (
              <Accordion
                key={org.id}
                elevation={2}
                sx={{
                  borderRadius: "8px !important",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ px: 3, py: 1 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flex: 1,
                    }}
                  >
                    <BusinessIcon color="action" />
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight="600">{org.name}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {org.id}
                      </Typography>
                    </Box>

                    {/* Frameworks */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        mr: 2,
                      }}
                    >
                      {(org.frameworks || []).slice(0, 3).map((fw) => (
                        <Chip
                          key={fw}
                          label={fw}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>

                    {/* Manager count badge */}
                    <Chip
                      icon={<PeopleIcon sx={{ fontSize: "14px !important" }} />}
                      label={`${managers.length} / ${MAX_MANAGERS} managers`}
                      size="small"
                      color={
                        isFull
                          ? "error"
                          : managers.length > 0
                            ? "success"
                            : "default"
                      }
                      variant={managers.length > 0 ? "filled" : "outlined"}
                      sx={{ mr: 1 }}
                    />

                    {/* Assign button */}
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<GroupAddIcon />}
                      disabled={isFull}
                      onClick={(e) => {
                        e.stopPropagation();
                        openAssignDialog(org);
                      }}
                      sx={{ textTransform: "none", flexShrink: 0 }}
                    >
                      {isFull ? "Full" : "Assign"}
                    </Button>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 3, pb: 3 }}>
                  {managers.length === 0 ? (
                    <Alert severity="info" icon={<PersonAddIcon />}>
                      No managers assigned yet. Click <strong>Assign</strong> to
                      delegate access.
                    </Alert>
                  ) : (
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    >
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#f9f9f9" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              User
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Email
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Role
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: "bold", textAlign: "right" }}
                            >
                              Remove
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {managers.map((mgr) => (
                            <TableRow
                              key={mgr.id}
                              sx={{ "&:hover": { bgcolor: "#fafafa" } }}
                            >
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 30,
                                      height: 30,
                                      fontSize: 13,
                                      bgcolor: "primary.light",
                                    }}
                                  >
                                    {mgr.name?.charAt(0)?.toUpperCase() || "?"}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight="500">
                                    {mgr.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {mgr.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {(mgr.role || []).map((r) => (
                                    <Chip
                                      key={r}
                                      label={r}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Remove access">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                      openRemoveDialog(org.id, mgr.id, mgr.name)
                                    }
                                  >
                                    <PersonRemoveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {!isFull && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {slots} slot{slots !== 1 ? "s" : ""} remaining for this
                      organization.
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* ── Assign Dialog ────────────────────────────────────────────────────── */}
      <Dialog
        open={assignDialog.open}
        onClose={closeAssignDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Assign Managers — {assignDialog.org?.name}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            You can assign up to <strong>{MAX_MANAGERS}</strong> managers per
            organization.{" "}
            {assignDialog.org && (
              <>
                Currently {(managersMap[assignDialog.org.id] || []).length}{" "}
                assigned.
              </>
            )}
          </Alert>

          <FormControl fullWidth>
            <InputLabel id="assign-users-label">
              Select Users to Assign
            </InputLabel>
            <Select
              labelId="assign-users-label"
              multiple
              value={selectedUsers}
              onChange={(e) => {
                const val = e.target.value;
                // Cap at MAX_MANAGERS
                const currentManagers = managersMap[assignDialog.org?.id] || [];
                const existingIds = currentManagers.map((u) => u.id);
                const newSelections =
                  typeof val === "string" ? val.split(",") : val;
                const newlySelected = newSelections.filter(
                  (id) => !existingIds.includes(id),
                );
                if (newlySelected.length + existingIds.length <= MAX_MANAGERS) {
                  setSelectedUsers(newSelections);
                }
              }}
              input={<OutlinedInput label="Select Users to Assign" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    const u = allUsers.find((u) => u.id === id);
                    return (
                      <Chip
                        key={id}
                        label={u?.name || id}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {allUsers.map((u) => {
                const currentManagers = managersMap[assignDialog.org?.id] || [];
                const isAlreadyMgr = currentManagers.some((m) => m.id === u.id);
                return (
                  <MenuItem key={u.id} value={u.id} disabled={isAlreadyMgr}>
                    <Checkbox
                      checked={selectedUsers.includes(u.id) || isAlreadyMgr}
                    />
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {u.name}
                          {isAlreadyMgr && (
                            <Chip
                              label="Already assigned"
                              size="small"
                              color="success"
                              sx={{ height: 18, fontSize: 10 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={u.email}
                    />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={closeAssignDialog}
            disabled={assigning}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assigning}
            variant="contained"
            startIcon={
              assigning ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <GroupAddIcon />
              )
            }
          >
            {assigning ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Remove Confirm Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={removeDialog.open}
        onClose={() => setRemoveDialog({ open: false })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Remove Manager Access
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning">
            Remove <strong>{removeDialog.userName}</strong>'s access to this
            organization? They will no longer be able to view or manage it.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setRemoveDialog({ open: false })}
            disabled={removing}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemove}
            disabled={removing}
            variant="contained"
            color="error"
            startIcon={
              removing ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PersonRemoveIcon />
              )
            }
          >
            {removing ? "Removing..." : "Remove Access"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
