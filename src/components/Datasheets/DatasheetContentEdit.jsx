import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Chip,
  Stack
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { FileText, Shield, Lock, Globe, Users, BarChart3 } from "lucide-react";

// Same icon set as the public datasheet page's ICON_MAP - keep these in sync
const ICON_OPTIONS = [
  { name: "FileText", Icon: FileText },
  { name: "Shield", Icon: Shield },
  { name: "Lock", Icon: Lock },
  { name: "Globe", Icon: Globe },
  { name: "Users", Icon: Users },
  { name: "BarChart3", Icon: BarChart3 },
];

// Derives a translucent badge background from the picked badge color,
// so admins only ever choose one color instead of two.
const hexToRgba = (hex, alpha = 0.12) => {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

export default function DatasheetContentEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("FileText");
  const [badgeLabel, setBadgeLabel] = useState("");
  const [badgeColor, setBadgeColor] = useState("#1976d2");
  const [published, setPublished] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState("");
  const [existingPdfUrl, setExistingPdfUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const thumbnailInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const API_BASE = "https://api.calvant.com/blog-service/api/datasheets";

  useEffect(() => {
    if (!isEditMode) return;

    const fetchDatasheet = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) throw new Error("Datasheet not found");
        const data = await res.json();

        setTitle(data.title || "");
        setSubtitle(data.subtitle || "");
        setDescription(data.description || "");
        setIconName(data.iconName || "FileText");
        setBadgeLabel(data.badgeLabel || "");
        setBadgeColor(data.badgeColor || "#1976d2");
        setPublished(!!data.published);
        setTags(data.tags || []);
        setExistingThumbnailUrl(data.thumbnailUrl || "");
        setExistingPdfUrl(data.pdfUrl || "");
      } catch (err) {
        console.error(err);
        alert("Failed to fetch datasheet");
      } finally {
        setLoading(false);
      }
    };

    fetchDatasheet();
  }, [id, isEditMode]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSaveSubmit = async () => {
    if (!title.trim() || !badgeLabel.trim()) {
      alert("Title and badge label are required");
      return;
    }
    if (!isEditMode && !thumbnailFile) {
      alert("A thumbnail image is required for a new datasheet");
      return;
    }
    if (!isEditMode && !pdfFile) {
      alert("A PDF file is required for a new datasheet");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("subtitle", subtitle.trim());
      formData.append("description", description.trim());
      formData.append("iconName", iconName);
      formData.append("badgeLabel", badgeLabel.trim());
      formData.append("badgeColor", badgeColor);
      formData.append("badgeBg", hexToRgba(badgeColor));
      formData.append("published", published);
      tags.forEach((tag) => formData.append("tags", tag));

      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      if (pdfFile) formData.append("pdf", pdfFile);

      const url = isEditMode ? `${API_BASE}/${id}` : API_BASE;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error("Save failed");

      navigate("/datasheets/content");
    } catch (err) {
      console.error(err);
      alert(isEditMode ? "Update failed" : "Create failed");
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
    <Box sx={{ p: 4, maxWidth: 1000, margin: "auto" }}>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Button onClick={() => navigate("/datasheets/content")}>
          <ArrowBackIcon /> Back
        </Button>

        <Button
          variant="contained"
          onClick={handleSaveSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isEditMode ? "Update" : "Create"}
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <div>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Subtitle"
              fullWidth
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </Box>

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              select
              label="Icon"
              fullWidth
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
            >
              {ICON_OPTIONS.map(({ name, Icon }) => (
                <MenuItem key={name} value={name}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Icon size={16} />
                    {name}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Badge Label"
              fullWidth
              placeholder="e.g. PIMS, SOC, GDPR"
              value={badgeLabel}
              onChange={(e) => setBadgeLabel(e.target.value)}
            />

            <TextField
              label="Badge Color"
              type="color"
              value={badgeColor}
              onChange={(e) => setBadgeColor(e.target.value)}
              sx={{ width: 120 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={badgeLabel || "Preview"}
              sx={{ color: badgeColor, backgroundColor: hexToRgba(badgeColor), fontWeight: 700 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              fullWidth
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
              {tags.map((tag) => (
                <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} size="small" />
              ))}
            </Stack>
          </Box>

          {/* Thumbnail upload */}
          <Typography sx={{ mb: 1, fontWeight: 600 }}>Thumbnail image</Typography>
          <Box
            onClick={() => thumbnailInputRef.current.click()}
            sx={{
              border: "2px dashed",
              borderColor: thumbnailFile ? "#4caf50" : "#bdbdbd",
              borderRadius: 3,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              mb: 3,
              bgcolor: thumbnailFile ? "rgba(76, 175, 80, 0.05)" : "transparent",
              "&:hover": { borderColor: "#1976d2", bgcolor: "rgba(25, 118, 210, 0.05)" }
            }}
          >
            {(thumbnailFile || existingThumbnailUrl) && (
              <Box
                component="img"
                src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : existingThumbnailUrl}
                alt="thumbnail preview"
                sx={{ width: 120, height: 80, objectFit: "cover", borderRadius: 2, mb: 1 }}
              />
            )}
            <CloudUploadIcon sx={{ fontSize: 32, color: thumbnailFile ? "#4caf50" : "#9e9e9e" }} />
            <Typography variant="body2" fontWeight="600">
              {thumbnailFile ? thumbnailFile.name : existingThumbnailUrl ? "Click to replace thumbnail" : "Click to upload thumbnail"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PNG, JPG, WEBP, or SVG
            </Typography>
          </Box>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style={{ display: "none" }}
            ref={thumbnailInputRef}
            onChange={(e) => e.target.files?.[0] && setThumbnailFile(e.target.files[0])}
          />

          {/* PDF upload */}
          <Typography sx={{ mb: 1, fontWeight: 600 }}>Datasheet PDF</Typography>
          <Box
            onClick={() => pdfInputRef.current.click()}
            sx={{
              border: "2px dashed",
              borderColor: pdfFile ? "#4caf50" : "#bdbdbd",
              borderRadius: 3,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              mb: 3,
              bgcolor: pdfFile ? "rgba(76, 175, 80, 0.05)" : "transparent",
              "&:hover": { borderColor: "#1976d2", bgcolor: "rgba(25, 118, 210, 0.05)" }
            }}
          >
            <PictureAsPdfIcon sx={{ fontSize: 32, color: pdfFile ? "#4caf50" : existingPdfUrl ? "#ef4444" : "#9e9e9e" }} />
            <Typography variant="body2" fontWeight="600">
              {pdfFile
                ? pdfFile.name
                : existingPdfUrl
                ? "Click to replace PDF"
                : "Click to upload PDF"}
            </Typography>
            {existingPdfUrl && !pdfFile && (
              <Typography variant="caption">
                <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  View current PDF
                </a>
              </Typography>
            )}
          </Box>
          <input
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            ref={pdfInputRef}
            onChange={(e) => e.target.files?.[0] && setPdfFile(e.target.files[0])}
          />

          <FormControlLabel
            control={<Switch checked={published} onChange={(e) => setPublished(e.target.checked)} />}
            label="Published (visible on the public /datasheet page)"
          />
        </div>
      </Paper>
    </Box>
  );
}