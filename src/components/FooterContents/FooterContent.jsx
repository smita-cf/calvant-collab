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
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
  Fade
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PostAddIcon from '@mui/icons-material/PostAdd';

export default function FooterContent() {
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://api.calvant.com/footer-service/api/footer-content";

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/list`);
      const responseData = await res.json();
      setContents(responseData.data || responseData || []);
    } catch (error) {
      console.error("Failed to fetch footer contents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this footer content?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setContents((prev) => prev.filter((content) => content.id !== id && content._id !== id));
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
          Footer Content Manager
        </Typography>

        <Button 
          variant="contained" 
          startIcon={<PostAddIcon />}
          onClick={() => navigate('/footer-content/add')}
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
          Add Content
        </Button>
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
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#455a64' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={40} thickness={4} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
                    Fetching footer content...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : contents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="text.secondary" fontWeight="light">
                    No footer content found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              contents.map((content) => (
                <TableRow 
                  key={content.id || content._id} 
                  hover 
                  sx={{ 
                    transition: '0.2s ease', 
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } 
                  }}
                >
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                      {content.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, textTransform: 'capitalize' }}>
                      {content.type}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Content" TransitionComponent={Fade}>
                      <IconButton 
                        onClick={() => navigate(`/footer-content/edit/${content.type}`)}
                        sx={{ color: '#1976d2', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }, mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Permanently" TransitionComponent={Fade}>
                      <IconButton 
                        onClick={() => handleDelete(content.id || content._id)}
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
    </Box>
  );
}
