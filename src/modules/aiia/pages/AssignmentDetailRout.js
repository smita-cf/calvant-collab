import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { stage1Api } from "../services/aiiaApi";
import AssignmentDetailPage from "../components/AssignementDetailPage";

/**
 * Route-level wrapper for AssignmentDetailPage.
 *
 * Fetches the assignment by id from the API. We can't rely on
 * react-router-style `location.state` here — Next.js's router.push()
 * only accepts a URL, not an object with { pathname, state }, so
 * `location.state` is always undefined in this app. Fetching by id
 * also means the page works correctly on a hard refresh or direct link.
 */
export default function AssignmentDetailRoute() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await stage1Api.getById(id);
      const data = response.data?.data || response.data;
      if (!data) {
        setError("not-found");
      } else {
        setAssignment(data);
      }
    } catch (err) {
      console.error("Error fetching assignment:", err);
      setError("not-found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: "#64748b",
          fontSize: 14,
        }}
      >
        Loading assessment...
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: "#64748b",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 48 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
          Assessment not found
        </div>
        <div style={{ fontSize: 13 }}>
          Please access this page from your assignments list.
        </div>
        <button
          onClick={() => router.push("/aiia")}
          style={{
            marginTop: 8,
            padding: "9px 20px",
            borderRadius: 8,
            border: "1.5px solid #3b82f6",
            background: "white",
            color: "#3b82f6",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <AssignmentDetailPage
      assignment={assignment}
      onBack={() => router.back()}
      onSaved={() => {
        fetchAssignment();
      }}
    />
  );
}
