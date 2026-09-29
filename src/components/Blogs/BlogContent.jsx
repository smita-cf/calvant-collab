import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
  Fade,
  TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PostAddIcon from '@mui/icons-material/PostAdd';

export default function BlogContent() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const API_BASE = "https://api.calvant.com/blog-service/api/blogs";

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}?page=${page + 1}&limit=${rowsPerPage}`);
      const responseData = await res.json();
      
      if (responseData && Array.isArray(responseData.data)) {
        setBlogs(responseData.data);
        // Robustly catch the total count from various common field names
        setTotalItems(responseData.totalItems || responseData.total_items || responseData.totalElements || responseData.total_elements || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setBlogs(responseData);
        setTotalItems(responseData.length);
      } else {
        setBlogs([]);
        setTotalItems(0);
        console.warn("API returned unexpected format:", responseData);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this blog post?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((blog) => blog.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <Box sx={{ p: 4, width: '100%', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

      {/* 🚀 Sleek Top Header & Action */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <Typography variant="h4" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #1976d2, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Blog Content Manager
        </Typography>

        <Button
          variant="contained"
          startIcon={<PostAddIcon />}
          onClick={() => navigate('/blogs/content/add')}
          sx={{
            borderRadius: '24px',
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            py: 1.5,
            boxShadow: '0 8px 16px rgba(25, 118, 210, 0.24)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 20px rgba(25, 118, 210, 0.4)' }
          }}
        >
          Create New Post
        </Button>
      </Box>

      {/* 🚀 Top Pagination for better visibility */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 600,
              color: '#475569'
            }
          }}
        />
      </Box>

      {/* 📊 Premium Transparent Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: 'rgba(240, 244, 248, 0.7)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Cover</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Blog Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#455a64' }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={40} thickness={4} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
                    Fetching published blogs...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (!blogs || !Array.isArray(blogs) || blogs.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="text.secondary" fontWeight="light">
                    No articles found. Write your first amazing post!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow
                  key={blog.id}
                  hover
                  sx={{
                    transition: '0.2s ease',
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                  }}
                >
                  <TableCell>
                    {blog.image?.url ? (
                      <Box
                        component="img"
                        src={blog.image.url}
                        alt="cover"
                        sx={{
                          width: 80,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 1,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">No Cover</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                      {blog.title}
                    </Typography>
                    {(blog.featured || blog.isFeatured) && (
                      <Typography variant="caption" sx={{ color: '#d97706', bgcolor: '#fef3c7', px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold', ml: 1 }}>
                        ★ Featured
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                      {blog.category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{
                      color: blog.status === 'published' ? '#166534' : '#94a3b8',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {blog.status}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Post" TransitionComponent={Fade}>
                      <IconButton
                        onClick={() => navigate(`/blogs/content/edit/${blog.slugUrl || blog.slug || blog.id}`)}
                        sx={{ color: '#1976d2', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }, mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Permanently" TransitionComponent={Fade}>
                      <IconButton
                        onClick={() => handleDelete(blog.id)}
                        sx={{ color: '#ef4444', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          mt: 2,
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 4,
          backgroundColor: 'rgba(25, 118, 210, 0.08)', // Tinted to make it stand out
          backdropFilter: 'blur(20px)',
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontWeight: 700,
            color: '#1e293b'
          }
        }}
      />
    </Box>
  );
}
