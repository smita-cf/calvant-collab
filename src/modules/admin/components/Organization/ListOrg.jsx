'use client'

import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../api/adminAxios";

import {
  Box, Button, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, IconButton,
  Tooltip, CircularProgress, Alert, Chip
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star"; // partner badge

const ListOrg = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useHistory();

  // get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isSuperAdmin = user?.role?.includes("super_admin");
  const isRoot = user?.role?.includes("root");

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      // root of partner org → fetch only child orgs
      // super_admin → fetch all
      const endpoint = isRoot && !isSuperAdmin
        ? "https://api.calvant.com/user-service/api/organizations/children"
        : "https://api.calvant.com/user-service/api/organizations";
      const { data } = await api.get(endpoint);
      setOrgs(Array.isArray(data) ? data : data.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/organizations/${id}`);
      fetchOrgs();
    } catch (err) {
      alert("Failed to delete: " + (err.response?.data || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {isRoot && !isSuperAdmin ? "Child Organizations" : "Organizations"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isRoot && !isSuperAdmin
              ? "Organizations created under your partner account."
              : "Manage all client and internal organizations."}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Reload">
            <IconButton onClick={fetchOrgs} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate.push("/organizations/create")}
          >
            Add Organization
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : orgs.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">No organizations found.</Typography>
            <Button sx={{ mt: 2 }} onClick={() => navigate.push("/organizations/create")}>
              Create your first one
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Frameworks</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Max Users</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orgs.map((org) => (
                  <TableRow
                    key={org._id || org.id}
                    sx={{ "&:hover": { bgcolor: "#fafafa" } }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <BusinessIcon color="action" />
                        <Typography variant="subtitle1" fontWeight="500">
                          {org.name}
                        </Typography>
                        {org.isPartner && (
                          <Tooltip title="Partner Organization">
                            <StarIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                        {org._id || org.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(org.frameworks || []).map((fw) => (
                          <Chip key={fw} label={fw} size="small" variant="outlined" color="primary" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {org.maxUsers ?? "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete Organization">
                        <span>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(org._id || org.id)}
                            disabled={deletingId === (org._id || org.id)}
                          >
                            {deletingId === (org._id || org.id)
                              ? <CircularProgress size={20} color="inherit" />
                              : <DeleteIcon />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ListOrg;