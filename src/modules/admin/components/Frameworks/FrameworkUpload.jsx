'use client'

import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  MenuItem,
  Paper,
  IconButton,
  Alert,
  LinearProgress,
  Chip,
  Divider,
  Stack,
  TextField,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://api.calvant.com";
const FRAMEWORKS_URL = `${API_BASE}/framework/api/frameworks`;
const UPLOAD_URL     = `${API_BASE}/framework/api/library/upload`;
const CONTROLS_URL   = (code) => `${API_BASE}/framework/api/controls/framework/${code}`;

const ACCEPTED_TYPES = ".xlsx,.xls";

export default function FrameworkUpload() {
  const navigate = useHistory();
  const dropRef  = useRef(null);

  const [frameworks,       setFrameworks]       = useState([]);
  const [frameworkCode,    setFrameworkCode]     = useState("");
  const [file,             setFile]             = useState(null);
  const [uploading,        setUploading]        = useState(false);
  const [progress,         setProgress]         = useState(0);
  const [error,            setError]            = useState(null);
  const [result,           setResult]           = useState(null);
  const [dragging,         setDragging]         = useState(false);

  // Per-framework upload status cache: { [code]: { checked: bool, controlCount: number } }
  const [fwStatus,         setFwStatus]         = useState({});
  const [checkingStatus,   setCheckingStatus]   = useState(false);

  /* â”€â”€ Load available frameworks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    axios.get(FRAMEWORKS_URL)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setFrameworks(list);
      })
      .catch(() => setFrameworks([]));
  }, []);

  /* â”€â”€ Check upload status whenever frameworkCode changes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    if (!frameworkCode) return;

    // Already checked â€“ no need to re-fetch
    if (fwStatus[frameworkCode]?.checked) return;

    setCheckingStatus(true);

    axios.get(CONTROLS_URL(frameworkCode))
      .then((res) => {
        const controls = Array.isArray(res.data) ? res.data : [];
        setFwStatus((prev) => ({
          ...prev,
          [frameworkCode]: { checked: true, controlCount: controls.length },
        }));
      })
      .catch(() => {
        // Treat errors (404 / 500) as "no controls uploaded yet"
        setFwStatus((prev) => ({
          ...prev,
          [frameworkCode]: { checked: true, controlCount: 0 },
        }));
      })
      .finally(() => setCheckingStatus(false));
  }, [frameworkCode]);

  const currentStatus   = fwStatus[frameworkCode];
  const alreadyUploaded = currentStatus?.checked && currentStatus.controlCount > 0;

  /* â”€â”€ After a successful upload, refresh status for current code â”€â”€â”€â”€ */
  const invalidateCurrentStatus = () => {
    setFwStatus((prev) => {
      const next = { ...prev };
      delete next[frameworkCode];
      return next;
    });
  };

  /* â”€â”€ Drag & drop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) acceptFile(dropped);
  };

  const acceptFile = (f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      setError("Only .xlsx or .xls files are accepted.");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  /* â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const handleUpload = async () => {
    if (!frameworkCode) { setError("Please select a framework."); return; }
    if (!file)          { setError("Please select an Excel file."); return; }

    setUploading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    const fd = new FormData();
    fd.append("frameworkCode", frameworkCode);
    fd.append("file", file);

    try {
      const res = await axios.post(UPLOAD_URL, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setResult(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      setFile(null);
      invalidateCurrentStatus(); // Force re-check next time user interacts
    } catch (err) {
      const msg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.message || "Upload failed.";
      setError(msg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const formatBytes = (b) => {
    if (b < 1024)        return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* â”€â”€ Status adornment for the framework selector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const statusAdornment = frameworkCode && (
    <InputAdornment position="end" sx={{ mr: 3 }}>
      {checkingStatus ? (
        <Tooltip title="Checking upload statusâ€¦">
          <HourglassEmptyIcon fontSize="small" sx={{ color: "text.disabled", animation: "spin 1.2s linear infinite", "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } } }} />
        </Tooltip>
      ) : alreadyUploaded ? (
        <Tooltip title={`${currentStatus.controlCount} controls already uploaded`}>
          <CheckCircleIcon fontSize="small" sx={{ color: "success.main" }} />
        </Tooltip>
      ) : null}
    </InputAdornment>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 720, margin: "auto" }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate.push(-1)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <UploadFileIcon sx={{ color: "primary.main", fontSize: 28 }} />
        <Typography variant="h4" fontWeight={800}>
          Upload Framework Controls
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>

        {error  && <Alert severity="error"   sx={{ mb: 2.5 }} onClose={() => setError(null)}>{error}</Alert>}
        {result && (
          <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon />}
            sx={{ mb: 2.5, "& .MuiAlert-message": { fontFamily: "monospace", fontSize: "0.85rem" } }}
            onClose={() => setResult(null)}
          >
            {result}
          </Alert>
        )}

        {/* Framework selector */}
        <TextField
          select
          label="Framework *"
          value={frameworkCode}
          onChange={(e) => { setFrameworkCode(e.target.value); setError(null); }}
          fullWidth
          sx={{ mb: alreadyUploaded ? 1.5 : 3 }}
          helperText="Select the target framework. Create it first if it doesn't appear here."
          InputProps={{ endAdornment: statusAdornment }}
        >
          <MenuItem value="" disabled><em>â€” Select a framework â€”</em></MenuItem>
          {frameworks.map((fw) => (
            <MenuItem key={fw.id} value={fw.code}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ width: "100%" }}>
                <strong>{fw.code}</strong>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  {fw.name} {fw.version && `(${fw.version})`}
                </Typography>
                {fwStatus[fw.code]?.checked && fwStatus[fw.code].controlCount > 0 && (
                  <Tooltip title={`${fwStatus[fw.code].controlCount} controls uploaded`}>
                    <CheckCircleIcon fontSize="small" sx={{ color: "success.main", ml: "auto" }} />
                  </Tooltip>
                )}
              </Stack>
            </MenuItem>
          ))}
        </TextField>

        {/* Already-uploaded banner */}
        {alreadyUploaded && (
          <Alert
            severity="warning"
            icon={<CheckCircleIcon sx={{ color: "success.main" }} />}
            sx={{ mb: 3, alignItems: "center" }}
          >
            <strong>{frameworkCode}</strong> already has{" "}
            <strong>{currentStatus.controlCount} controls</strong> uploaded.
            Re-uploading will <strong>wipe and replace</strong> all existing mappings.
          </Alert>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Drop zone */}
        <Box
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            border: "2px dashed",
            borderColor: dragging ? "primary.main" : "divider",
            borderRadius: 2,
            p: 5,
            textAlign: "center",
            transition: "border-color 0.2s, background 0.2s",
            bgcolor: dragging ? "primary.50" : "background.default",
            cursor: "pointer",
            mb: 3,
          }}
          onClick={() => document.getElementById("fw-file-input").click()}
        >
          <input
            id="fw-file-input"
            type="file"
            accept={ACCEPTED_TYPES}
            style={{ display: "none" }}
            onChange={(e) => { if (e.target.files[0]) acceptFile(e.target.files[0]); }}
          />
          <UploadFileIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            {dragging ? "Drop it here" : "Drag & drop an Excel file, or click to browse"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Accepts .xlsx and .xls
          </Typography>
        </Box>

        {/* Selected file */}
        {file && (
          <Paper
            variant="outlined"
            sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2, mb: 3 }}
          >
            <InsertDriveFileIcon sx={{ color: "success.main" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>{file.name}</Typography>
              <Typography variant="caption" color="text.secondary">{formatBytes(file.size)}</Typography>
            </Box>
            <Chip label="Ready" color="success" size="small" />
            <IconButton size="small" onClick={() => setFile(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        )}

        {/* Progress */}
        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Uploadingâ€¦ {progress}%
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
          <Button variant="outlined" onClick={() => navigate.push(-1)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={alreadyUploaded ? "warning" : "primary"}
            onClick={handleUpload}
            disabled={uploading || !file || !frameworkCode}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
            sx={{ minWidth: 160 }}
          >
            {uploading ? "Uploadingâ€¦" : alreadyUploaded ? "Replace Controls" : "Upload Controls"}
          </Button>
        </Box>
      </Paper>

      {/* Hint */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
        The Excel file must follow the framework column schema. Re-uploading a framework will wipe and
        replace its existing mappings.
      </Typography>
    </Box>
  );
}
