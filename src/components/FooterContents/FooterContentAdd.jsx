import React, { useState, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Fix for jodit-react ESM/CJS default export mismatch
const JoditEditor = JoditReact?.default ?? JoditReact;

export default function FooterContentAdd() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("privacy");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const editorRef = useRef(null);

  const API = "https://api.calvant.com/footer-service/api/footer-content";

  const config = useMemo(() => ({
    readonly: false,
    height: 400,
    placeholder: "Write footer content here..."
  }), []);

  const handleSubmit = async () => {
    if (!name.trim() || !type.trim()) {
      alert("Name & Type required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        type,
        content
      };

      await axios.post(API, payload);

      alert("Footer content created successfully 🚀");
      navigate("/footer-content/list");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: "1000px", margin: "auto" }}>
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/footer-content/list")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="800">
          Add Footer Content
        </Typography>
      </Box>

      {loading && <CircularProgress />}

      {!loading && (
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                label="Title"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <TextField
                select
                label="Type"
                fullWidth
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
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
              config={config}
              onBlur={(newContent) => setContent(newContent)}
            />

            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ 
                mt: 4,
                borderRadius: '24px',
                px: 4,
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 8px 16px rgba(25, 118, 210, 0.24)'
              }}
            >
              Create Content
            </Button>

          </div>
        </Paper>
      )}
    </Box>
  );
}
