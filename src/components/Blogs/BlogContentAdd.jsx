import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

// Fix for jodit-react ESM/CJS default export mismatch
const JoditEditor = JoditReact?.default ?? JoditReact;

export default function AddBlog() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("published");
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);

  const editorRef = useRef(null);

  const API = "https://api.calvant.com/blog-service/api/blogs";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://api.calvant.com/blog-service/api/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const config = useMemo(() => ({
    readonly: false,
    height: 400,
    placeholder: "Write your blog content here..."
  }), []);

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");

  const handleSubmit = async () => {
    if (!title.trim() || !category.trim()) {
      alert("Title & Category required");
      return;
    }

    try {
      setLoading(true);

      const finalSlug = slug.trim() || generateSlug(title);

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        slugUrl: finalSlug,
        category,
        content,
        status,
        featured: !!featured,
        image: image ? { url: image, alt: "" } : null
      };

      console.log("Create Payload:", payload);

      await axios.post(API, payload);

      alert("Blog created successfully 🚀");
      navigate("/blogs/content");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: "1000px", margin: "auto" }}>

      <Typography variant="h4" mb={3}>
        Create Blog
      </Typography>

      {loading && <CircularProgress />}

      {!loading && (
        <Paper sx={{ p: 4 }}>
          {/* Replaced <form onSubmit> with a <div> — avoids the MUI Paper/form conflict */}
          <div>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <TextField
                label="Slug*"
                fullWidth
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <TextField
                select
                label="Category"
                fullWidth
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id || cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Cover Image URL"
              fullWidth
              value={image}
              onChange={(e) => setImage(e.target.value)}
              sx={{ mb: 2 }}
            />

            {image && (
              <img
                src={image}
                alt="preview"
                style={{
                  width: 150,
                  marginBottom: 20,
                  borderRadius: 8
                }}
              />
            )}

            <Typography sx={{ mb: 1 }}>Content</Typography>

            <JoditEditor
              ref={editorRef}
              value={content}
              config={config}
              onBlur={(newContent) => setContent(newContent)}
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
                label="Featured Blog"
              />
            </Box>

            {/* onClick instead of type="submit" since there's no form */}
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ mt: 4 }}
            >
              Create Blog
            </Button>

          </div>
        </Paper>
      )}
    </Box>
  );
}