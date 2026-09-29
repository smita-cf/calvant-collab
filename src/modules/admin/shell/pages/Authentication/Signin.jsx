'use client'

import React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { captureActivity } from "../../services/activities";
import { isTokenExpired } from "../../utils/authUtils";

const Signin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Redirect if already authenticated ──────────────────────────
  React.useEffect(() => {
    if (!isTokenExpired()) {
      navigate("/");
    }
  }, [navigate]);

  // Merged state for easier management
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    region: "INDIA", // Default to US (matching original logic)
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const isExpired =
    new URLSearchParams(location.search).get("expired") === "true";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password, region } = formData;

    try {
      sessionStorage.setItem("selected_region", region);

      const url = `https://api.calvant.com/user-service/api/users/login`;
      const response = await axios.post(url, { email, password });

      console.log("Login response:", response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("tokenTimestamp", Date.now().toString());
      localStorage.setItem("uid", response.data.userid);
      localStorage.setItem("uname", response.data.name);
      localStorage.setItem("email", email);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("myObject", JSON.stringify(response.data));

      if (response.data) {
        const userWithRegion = { ...response.data, region };
        sessionStorage.setItem("user", JSON.stringify(userWithRegion));
      }

      await captureActivity({
        action: "LOGIN",
        name: response.data.name || email,
        email: email,
        url: "/signin",
        item: [{ role: response.data.role, region }],
      });

      // ── Partner org check ─────────────────────────────────────────
      const userRole = response.data.role;
      const userOrg = response.data.organization;

      const isRoot = Array.isArray(userRole)
        ? userRole.includes("root")
        : userRole === "root";

      const isSuperAdmin = Array.isArray(userRole)
        ? userRole.includes("super_admin")
        : userRole === "super_admin";

      if (isRoot && !isSuperAdmin && userOrg) {
        try {
          const orgRes = await axios.get(
            `https://api.calvant.com/user-service/api/organizations/${userOrg}`,
            { headers: { Authorization: `Bearer ${response.data.token}` } },
          );
          console.log(orgRes.data)
          if (orgRes.data?.partner === true) {
            sessionStorage.setItem("isPartnerOrg", "true");
          } else {
            sessionStorage.removeItem("isPartnerOrg");
          }
        } catch (orgErr) {
          console.error("Org fetch failed:", orgErr);
          sessionStorage.removeItem("isPartnerOrg");
        }
      } else {
        sessionStorage.removeItem("isPartnerOrg");
      }
      // ─────────────────────────────────────────────────────────────

      handleLogin();
    } catch (err) {
      console.error(err);
      sessionStorage.removeItem("selected_region");
      const errorMsg =
        err.response?.data?.error || "An error occurred while logging in.";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.pathname = "/";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: "100%",
          borderRadius: 4,
          boxShadow:
            "0 10px 40px rgba(59, 130, 246, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          bgcolor: "#ffffff",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo Section */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box
              component="img"
              src="/static/images/logo.png"
              alt="Logo"
              sx={{ width: 90 }}
            />
          </Box>

          <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
            Admin Login
          </Typography>

          {/* Session Expired Message */}
          {isExpired && !error && (
            <Alert severity="warning" sx={{ mt: 3, mb: 1, borderRadius: 2 }}>
              Your session has expired. Please log in again.
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                p: 1,
                borderRadius: 1,
                bgcolor: "error.light",
                color: "error.contrastText",
              }}
            >
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* --- NEW REGION SELECTOR (Ported from Original) --- */}
            <TextField
              select
              label="Region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              fullWidth
              margin="normal"
              size="small"
              disabled={loading}
            >
              <MenuItem value="INDIA">India</MenuItem>
              <MenuItem value="US">United States (US)</MenuItem>
              <MenuItem value="EU">European Union (EU)</MenuItem>
              <MenuItem value="AUTO">Auto (Geolocation)</MenuItem>
            </TextField>

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              size="small"
              required
              disabled={loading}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              size="small"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 3, py: 1.1, fontWeight: 600 }}
            >
              {loading ? "Logging in…" : "Login"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Signin;
