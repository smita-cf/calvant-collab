import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Paper,
  IconButton
} from "@mui/material";
import JoditReact from "jodit-react";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Fix for jodit-react ESM/CJS default export mismatch
const JoditEditor = JoditReact?.default ?? JoditReact;

export default function FooterContentEdit() {
  const navigate = useNavigate();
  const { type: typeParam } = useParams();
  const location = useLocation();
  const [realId, setRealId] = useState("");

  // Determine type from param or URL path (for direct sidebar links)
  const effectiveType = typeParam || location.pathname.split('/').pop();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("privacy");
  const [content, setContent] = useState("");

  const editorRef = useRef(null);

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start writing footer content here...",
      height: 400
    }),
    []
  );

  const API_BASE = "https://api.calvant.com/footer-service/api/footer-content";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/type/${effectiveType}`);
        const responseData = await res.json();
        const data = responseData.data || responseData;

        setRealId(data.id || data._id);
        setName(data.name || "");
        setType(data.type || "privacy");
        setContent(data.content || "");

      } catch (err) {
        console.error(err);
        alert("Failed to fetch footer content");
      } finally {
        setLoading(false);
      }
    };

    if (effectiveType) fetchContent();
  }, [effectiveType]);

  const handleSaveSubmit = async () => {
    if (!name.trim() || !type.trim()) {
      alert("Name & Type required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),
        type,
        content
      };

      const res = await fetch(`${API_BASE}/${realId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Save failed");

      alert("Footer content updated successfully 🚀");
      navigate("/footer-content/list");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: "auto" }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/footer-content/list")}>
          Back to List
        </Button>

        <Button
          variant="contained"
          onClick={handleSaveSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{ 
            borderRadius: '24px',
            px: 4,
            py: 1.5,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 8px 16px rgba(25, 118, 210, 0.24)'
          }}
        >
          Update Content
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              select
              label="Type"
              fullWidth
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="privacy">Privacy Policy</MenuItem>
              <MenuItem value="terms">Terms & Conditions</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="cookie">Cookie Policy</MenuItem>
              <MenuItem value="about">About Us</MenuItem>
            </TextField>
          </Box>

          <Typography sx={{ mb: 1, fontWeight: 600 }}>Content</Typography>

          <JoditEditor
            ref={editorRef}
            value={content}
            config={editorConfig}
            onBlur={(val) => setContent(val)}
          />
        </div>
      </Paper>
    </Box>
  );
}
