import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import api from "../../services/api";
import { captureActivity, ACTIONS } from "../../services/activities";

import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Stack,
  Alert,
  Divider,
  CircularProgress,
  Grid,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import BusinessIcon from "@mui/icons-material/Business";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";

// ── Helper function ────────────────────────────────────────────────────────
const normalizeArray = (data, keepEmpty = false) => {
  if (!data) return [];
  if (Array.isArray(data)) {
    if (keepEmpty) return data;
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

// ── Small section label helper ─────────────────────────────────────────────
const SectionLabel = ({ icon: Icon, children }) => (
  <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
    {Icon && <Icon sx={{ fontSize: 18, color: "primary.main" }} />}
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "text.secondary",
        fontSize: "0.7rem",
      }}
    >
      {children}
    </Typography>
  </Stack>
);

function VendorCreate() {
  const navigate = useNavigate();

  // Decode JWT
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const loggedInRole = Array.isArray(decoded?.role)
    ? decoded.role[0]
    : decoded?.role;

  // Guard: only root can access this form
  if (loggedInRole !== "root") {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="warning">
          You do not have permission to create vendors.
        </Alert>
      </Box>
    );
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vendorName: "",
    address: "",
    serviceType: "",
    // Primary Contact Person (poc)
    pocName: "",
    pocDesignation: "",
    pocEmail: "",
    pocPhone: "",
    // Date of Assessment
    assessmentDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.vendorName.trim()) {
      return setError("Vendor Name is required.");
    }

    if (!formData.pocEmail.trim()) {
      return setError("Contact Person Email is required.");
    }

    if (!formData.pocName.trim()) {
      return setError("Contact Person Name is required.");
    }

    setLoading(true);

    try {
      // Read organization ID from localStorage myObject
      const myObject = JSON.parse(localStorage.getItem("myObject") || "{}");
      const organizationId =
        myObject?.organization || decoded?.organization || null;

      const poc = formData.pocName.trim();

      // Step 1: Create Vendor
      const payload = {
        vendorName: formData.vendorName.trim(),
        organization: organizationId,
        address: formData.address.trim(),
        serviceType: formData.serviceType.trim(),
        poc,
        createdBy: myObject?.id || decoded?.sub || "",
        assessmentDate: formData.assessmentDate || null,
      };

      const token = localStorage.getItem("token");
      await axios.post(
        "https://api.calvant.com/tprm-service/api/tprm/vendors",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Step 2: Create User for Vendor POC
      const rolesArr = normalizeArray(["user"]);

      const payload_user = {
        name: formData.vendorName.trim(),
        email: formData.pocEmail.trim().toLowerCase(),
        role: normalizeArray(["user"]),
        organization: organizationId,
        // Auto-derive isAuditor from role — not user-input
        isAuditor:
          rolesArr.includes("auditor") || rolesArr.includes("audit_manager"),
        // Only send modules for "user" role
        modules: normalizeArray(["tprm"]),
        // Vendors only when tprm module selected
        vendors: [],
        // Password - using POC name as default password
        password: formData.pocName.trim(),
      };

      await api.post("/users/register", payload_user);

      captureActivity({
        action: ACTIONS.CREATE,
        item: [{ name: payload.vendorName }],
      });

      navigate("/vendors/list");
    } catch (err) {
      console.error("Error creating vendor/user:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create vendor.",
      );
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, mb: 5 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/vendors/list")}
            size="small"
            variant="outlined"
            disabled={loading}
            sx={{
              color: "blue",
              borderColor: "rgba(255,255,255,0.4)",
              "&:hover": { borderColor: "white", color: "black" },
            }}
          >
            List
          </Button>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "#fff", flexGrow: 1, textAlign: "center", pr: 6 }}
          >
            Create Vendor Profile
          </Typography>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {/* ── Section 1: Vendor Identity & Lifecycle ── */}
              <Box>
                <SectionLabel icon={StorefrontIcon}>
                  Vendor Identity
                </SectionLabel>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={7}>
                    <TextField
                      label="Vendor Name"
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleChange}
                      required
                      fullWidth
                      size="small"
                      placeholder="e.g. Acme Supplies Ltd."
                      disabled={loading}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  {/* <Grid item xs={12} md={5}>
                    <TextField
                      label="Assessment Date"
                      name="assessmentDate"
                      type="date"
                      value={formData.assessmentDate}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      disabled={loading}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid> */}
                </Grid>
              </Box>

              {/* ── Section 2: Operational Context ── */}
              <Box>
                <SectionLabel icon={MiscellaneousServicesIcon}>
                  Operation Details
                </SectionLabel>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nature of Services"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      placeholder="e.g. Cloud Hosting, Consulting"
                      disabled={loading}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Registered Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      placeholder="e.g. 123 Market St, NY"
                      disabled={loading}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* ── Section 3: Primary Contact ── */}
              <Box>
                <SectionLabel icon={ContactPhoneIcon}>
                  Authorized Contact
                </SectionLabel>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="POC Full Name"
                      name="pocName"
                      value={formData.pocName}
                      onChange={handleChange}
                      required
                      fullWidth
                      size="small"
                      placeholder="John Smith"
                      disabled={loading}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                      helperText="This full name will be the initial password"
                      FormHelperTextProps={{
                        sx: {
                          fontWeight: 700,
                          color: "primary.main",
                          fontSize: "0.68rem",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="POC Business Email"
                      name="pocEmail"
                      type="email"
                      value={formData.pocEmail}
                      onChange={handleChange}
                      required
                      fullWidth
                      size="small"
                      placeholder="john@vendor.com"
                      disabled={loading}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                      helperText="Username for future vendor logins"
                      FormHelperTextProps={{
                        sx: { fontWeight: 600, fontSize: "0.68rem" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* ── Submit Row ── */}
              <Box sx={{ pt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    textTransform: "none",
                    bgcolor: "#1e293b",
                    "&:hover": { bgcolor: "#0f172a" },
                    boxShadow: 2,
                  }}
                >
                  {loading
                    ? "Registering..."
                    : "Finalize & Record Vendor Profile"}
                </Button>
              </Box>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Container>
  );
}

export default VendorCreate;
