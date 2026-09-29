import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Paper
} from "@mui/material";
import JoditReact from "jodit-react";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Fix for jodit-react ESM/CJS default export mismatch
const JoditEditor = JoditReact?.default ?? JoditReact;

export default function BlogContentEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [realId, setRealId] = useState("");
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState("published");
  const [featured, setFeatured] = useState(false);

  const editorRef = useRef(null);

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start writing your blog content here...",
      height: 400
    }),
    []
  );

  const API_BASE = "https://api.calvant.com/blog-service/api/blogs";

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);

        const [catRes, blogRes] = await Promise.all([
          fetch("https://api.calvant.com/blog-service/api/categories"),
          fetch(`${API_BASE}/${id}`)
        ]);

        const catData = await catRes.json();
        const responseData = await blogRes.json();
        const data = responseData.data || responseData;

        setCategories(catData || []);
        setRealId(data._id || data.id);

        setTitle(data.title || "");
        setSlug(data.slugUrl || data.slug || "");
        setCategory(data.category || "");
        setContent(data.content || "");
        setCoverUrl(data.image?.url || "");
        setStatus(data.status || "published");
        setFeatured(!!data.featured);

      } catch (err) {
        console.error(err);
        alert("Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  const handleSaveSubmit = async () => {
    if (!title.trim() || !category.trim()) {
      alert("Title & Category required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        slugUrl: slug.trim(),
        content,
        category,
        status,
        featured: !!featured,
        image: coverUrl ? { url: coverUrl, alt: "" } : null
      };

      const res = await fetch(`${API_BASE}/${realId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Save failed");

      navigate("/blogs/content");
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
        <Button onClick={() => navigate("/blogs/content")}>
          <ArrowBackIcon /> Back
        </Button>

        <Button
          variant="contained"
          onClick={handleSaveSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          Update
        </Button>
      </Box>

      {/* Form — using <div> inside Paper, NOT a <form> tag */}
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
              label="Slug"
              fullWidth
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />

            <TextField
              select
              label="Category"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <MenuItem key={c._id || c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Cover URL"
            fullWidth
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            sx={{ mb: 2 }}
          />

          {coverUrl && (
            <img
              src={coverUrl}
              alt="preview"
              style={{ width: 150, marginBottom: 20, borderRadius: 8 }}
            />
          )}

          <Typography sx={{ mb: 1 }}>Content</Typography>

          <JoditEditor
            ref={editorRef}
            value={content}
            config={editorConfig}
            onBlur={(val) => setContent(val)}
          />

          <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
              }
              label="Featured"
            />
          </Box>
        </div>
      </Paper>
    </Box>
  );
}