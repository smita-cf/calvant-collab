import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  Box,
  Container,
  CircularProgress,
} from "@material-ui/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ComplianceReports = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // ── Resolve tenantId from session ──────────────────────────────────
        const userDataStr = sessionStorage.getItem("user");
        if (!userDataStr) throw new Error("No user data in session. Please log in.");

        const userData = JSON.parse(userDataStr);
        const orgId = userData.organization;
        if (!orgId) throw new Error("No organization assigned to current user.");

        const tenantRes = await axios.get(
          `https://api.calvant.com/user-service/api/organizations/${orgId}/tenant`,
          { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } },
        );
        const tenantId = tenantRes.data;

        // ── Fetch history scoped to this tenant ────────────────────────────
        const historyRes = await axios.get(
          `https://api.calvant.com/compliance-brain/compliance/${tenantId}/history?months=3`,
          { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } },
        );
        setHistory(historyRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load compliance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // ── Convert raw history → monthly average score per cloud ─────────────────
  const chartData = useMemo(() => {
    const map = {};

    history.forEach((item) => {
      const date = new Date(item.syncedAt);
      const month = date.toLocaleString("default", { month: "short" });

      if (!map[month]) {
        map[month] = {
          month,
          AWS: 0, awsCount: 0,
          GCP: 0, gcpCount: 0,
          M365: 0, m365Count: 0,
        };
      }

      if (item.cloud === "AWS") {
        map[month].AWS += item.score ?? (item.compliant ? 100 : 0);
        map[month].awsCount++;
      }

      if (item.cloud === "GCP") {
        map[month].GCP += item.score ?? (item.compliant ? 100 : 0);
        map[month].gcpCount++;
      }

      if (item.cloud === "M365") {
        map[month].M365 += item.score ?? (item.compliant ? 100 : 0);
        map[month].m365Count++;
      }
    });

    return Object.values(map).map((m) => ({
      month: m.month,
      AWS: m.awsCount ? Math.round(m.AWS / m.awsCount) : 0,
      GCP: m.gcpCount ? Math.round(m.GCP / m.gcpCount) : 0,
      M365: m.m365Count ? Math.round(m.M365 / m.m365Count) : 0,
    }));
  }, [history]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="lg">
      <Paper style={{ padding: 30, marginTop: 30, borderRadius: 12 }}>
        <Typography variant="h4" gutterBottom>
          Compliance Trend — Last 3 Months
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400} style={{ gap: 16, flexDirection: "column" }}>
            <CircularProgress size={48} thickness={4} />
            <Typography style={{ color: "#64748b", fontSize: 15 }}>Loading compliance data...</Typography>
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <Typography style={{ color: "#c62828", fontSize: 15 }}>⚠️ {error}</Typography>
          </Box>
        ) : chartData.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <Typography style={{ color: "#64748b", fontSize: 15 }}>No compliance data available for the last 3 months.</Typography>
          </Box>
        ) : (
          <Box height={400}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line type="monotone" dataKey="AWS" stroke="#FF9900" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="GCP" stroke="#4285F4" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="M365" stroke="#00A4EF" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ComplianceReports;