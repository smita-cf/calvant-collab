import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const API_BASE = "https://api.calvant.com/blog-service/api/categories";

export default function BlogCat() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For Top Create
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creating, setCreating] = useState(false);

  // For Inline Edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setCategories(res.data);
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setCreating(true);
      const res = await axios.post(API_BASE, { name: newCategoryName });
      setCategories([...categories, res.data]);
      setNewCategoryName('');
    } catch (error) {
      console.error("Create error:", error);
      alert("Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete category");
    }
  };

  // Toggle Edit view
  const startEditing = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) {
      alert("Name cannot be empty");
      return;
    }
    try {
      const res = await axios.put(`${API_BASE}/${id}`, { name: editName });
      setCategories(categories.map(cat => cat.id === id ? res.data : cat));
      setEditingId(null);
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update category");
    }
  };

  if (loading && categories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '800px', mx: 'auto', fontFamily: "'Inter', sans-serif" }}>
      <Typography variant="h4" fontWeight="800" mb={4} sx={{ background: 'linear-gradient(45deg, #1976d2, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Category Management
      </Typography>

      {/* Top Create Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" mb={2} fontWeight={600}>Create New Category</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Category Name"
            variant="outlined"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            disabled={creating}
            size="small"
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <Button 
            variant="contained" 
            onClick={handleCreate} 
            disabled={creating || !newCategoryName.trim()}
            sx={{ px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {creating ? <CircularProgress size={24} color="inherit" /> : "Create"}
          </Button>
        </Box>
      </Paper>

      {/* Table Section */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>Category Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', width: '120px', fontSize: '1.05rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No categories found. Create your first one above!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    {editingId === row.id ? (
                      <TextField
                        size="small"
                        fullWidth
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate(row.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                    ) : (
                      <Typography fontWeight={500}>{row.name}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editingId === row.id ? (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton color="success" onClick={() => handleUpdate(row.id)} size="small" title="Save">
                          <CheckIcon />
                        </IconButton>
                        <IconButton color="error" onClick={cancelEditing} size="small" title="Cancel">
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton color="primary" onClick={() => startEditing(row)} size="small" title="Edit">
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(row.id)} size="small" title="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
