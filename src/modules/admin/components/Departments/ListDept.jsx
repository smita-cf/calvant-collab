'use client'

import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../api/adminAxios";

// MUI Imports
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";

export default function ListDepartment() {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);
  const [editName, setEditName] = useState("");

  // Delete Confirm States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Get User Organization
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  let userOrg = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userOrg = decoded.organization;
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

  // Fetch Departments
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("https://api.calvant.com/user-service/api/departments");
      setDepartments(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setError(err.response?.data?.error || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Handle Delete — open confirmation dialog
  const openDeleteDialog = (dept) => {
    setDeptToDelete(dept);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeptToDelete(null);
    setConfirmText("");
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`departments/${deptToDelete.id}`);
      fetchDepartments();
      closeDeleteDialog();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete department");
      closeDeleteDialog();
    }
  };

  // Handle Edit Open
  const openEditDialog = (dept) => {
    setDeptToEdit(dept);
    setEditName(dept.name);
    setEditDialogOpen(true);
  };

  // Handle Edit Close
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setDeptToEdit(null);
    setEditName("");
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!editName.trim()) return;

    try {
      await api.put(`/departments/${deptToEdit.id}`, { name: editName.trim() });
      fetchDepartments();
      closeEditDialog();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update department");
    }
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtering & Pagination Logic
  const filteredDepartments = departments.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredDepartments.length)
      : 0;

  const visibleRows = filteredDepartments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Paper sx={styles.paper}>
      {/* Header Section */}
      <Box sx={styles.headerContainer}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Departments List
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ p: 2, textAlign: "center" }}>
          {error}
        </Typography>
      )}

      {/* Table Section */}
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                sx={{ fontWeight: "bold", color: "#444", padding: "8px" }}
              >
                <SearchIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
                <TextField
                  variant="standard"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "bold", color: "#444" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((dept) => (
                <TableRow
                  key={dept._id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:hover": { backgroundColor: "#f9fafb" },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {dept.name}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => openEditDialog(dept)}
                        color="primary"
                        size="small"
                        sx={{ mr: 0.5 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => openDeleteDialog(dept)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Component */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDepartments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Department Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEditSubmit()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEditDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={!editName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            You are about to delete <strong>{deptToDelete?.name}</strong>. This
            action cannot be undone.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            Type <strong>confirm</strong> to proceed:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            size="small"
            placeholder="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && confirmText === "confirm" && confirmDelete()
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={confirmText !== "confirm"}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

// ---------------- Styles ----------------
const styles = {
  paper: {
    width: "100%",
    mb: 2,
    p: 2,
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    borderRadius: "12px",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
    pb: 2,
    borderBottom: "1px solid #eee",
  },
};
