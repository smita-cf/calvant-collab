'use client'

import React, { useState, useEffect, useRef } from 'react';
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function BlogsImage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [imageName, setImageName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // ⚠️ Base API URL for your backend server
  const API_BASE = "https://api.calvant.com/blog-service/api/blog-images"; 

  // --- Fetch List ---
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}?page=${page + 1}&limit=${rowsPerPage}`);
      const result = await res.json();
      
      // Handle the new paginated API response
      if (result && Array.isArray(result.data)) {
        setImages(result.data);
        // Robustly catch the total count from various common field names
        setTotalItems(result.totalItems || result.total_items || result.totalElements || result.total_elements || result.data.length);
      } else if (Array.isArray(result)) {
        setImages(result);
        setTotalItems(result.length);
      } else {
        setImages([]);
        setTotalItems(0);
        console.warn("API returned unexpected format:", result);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- Handle Upload ---
  const handleUploadSubmit = async () => {
    if (!imageName.trim() || !selectedFile) {
      alert("Please provide both a name and an image file.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("name", imageName);
      formData.append("imageUrl", selectedFile);

      const res = await fetch(API_BASE, {
        method: "POST",
        body: formData, 
      });

      if (!res.ok) throw new Error("Upload failed");

      handleCloseDialog();
      fetchImages();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Make sure your backend server is running.");
    } finally {
      setUploading(false);
    }
  };

  // --- Handle Delete ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this image from your secure AWS S3 Bucket?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  // --- Helpers ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setImageName("");
    setSelectedFile(null);
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
          Blog Image Architecture
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<CloudUploadIcon />}
          onClick={() => setOpenDialog(true)}
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
          Upload Secure Image
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
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Preview</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Component Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>AWS Path Detail</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Permanent Embed URL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#455a64' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={40} thickness={4} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
                    Fetching secure images...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (!images || !Array.isArray(images) || images.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="text.secondary" fontWeight="light">
                    No images discovered. Upload your first beautiful asset!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              images.map((img) => (
                <TableRow 
                  key={img.id} 
                  hover 
                  sx={{ 
                    transition: '0.2s ease', 
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } 
                  }}
                >
                  <TableCell>
                    <Box
                      component="img"
                      src={img.imageUrl} // We still load the image IN the table using the temporary URL
                      alt={img.name}
                      sx={{ 
                        width: 72, 
                        height: 72, 
                        objectFit: 'cover', 
                        borderRadius: 2,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                      {img.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', p: 0.8, borderRadius: 1, color: '#475569' }}>
                      {img.s3Key}
                    </Typography>
                  </TableCell>
                  <TableCell>
                     {/* 🚀 UPGRADED: Now copies the permanent safe link! */}
                     <Button 
                        size="small" 
                        variant="soft"
                        startIcon={<ContentCopyIcon fontSize="small"/>}
                        onClick={() => {
                          const permanentLink = `${API_BASE}/view?key=${encodeURIComponent(img.s3Key)}`;
                          navigator.clipboard.writeText(permanentLink);
                          alert("Permanent S3 Router Link copied! \nSafe to paste into your HTML code!");
                        }}
                        sx={{ 
                          color: '#1976d2', 
                          backgroundColor: 'rgba(25,118,210,0.1)',
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          '&:hover': { backgroundColor: 'rgba(25,118,210,0.2)' }
                        }}
                     >
                       Copy HTML Embed Link
                     </Button>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete Permanently" TransitionComponent={Fade}>
                      <IconButton 
                        onClick={() => handleDelete(img.id)}
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
          mb: 4,
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

      {/* 💻 Upload Dialog Framework */}
      <Dialog 
        open={openDialog} 
        onClose={!uploading ? handleCloseDialog : undefined} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3, padding: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
          Secure Image Upload
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            All files uploaded here are stored privately. 
          </Typography>
          
          <TextField
            label="Internal Reference Name"
            type="text"
            fullWidth
            required
            variant="filled"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            sx={{ mb: 3 }}
            disabled={uploading}
            InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
          />

          <Box 
            onClick={() => !uploading && fileInputRef.current.click()}
            sx={{ 
              border: '2px dashed', 
              borderColor: selectedFile ? '#4caf50' : '#bdbdbd',
              borderRadius: 3, 
              p: 4, 
              textAlign: 'center',
              cursor: uploading ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              bgcolor: selectedFile ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
              '&:hover': { borderColor: '#1976d2', bgcolor: 'rgba(25, 118, 210, 0.05)' }
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: selectedFile ? '#4caf50' : '#9e9e9e', mb: 1 }} />
            <Typography variant="h6" fontWeight="600" color={selectedFile ? '#2e7d32' : 'text.primary'}>
              {selectedFile ? selectedFile.name : "Click to Browse Photos"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Strictly restricted to images (.jpg, .png, .webp)
            </Typography>
          </Box>

          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={uploading}
            sx={{ fontWeight: 600, color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUploadSubmit} 
            variant="contained" 
            disabled={uploading || !imageName || !selectedFile}
            sx={{ 
              borderRadius: '20px', 
              px: 4, 
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
            }}
          >
            {uploading ? <CircularProgress size={24} color="inherit" /> : "Initiate Upload"}
          </Button>
        </DialogActions>
      </Dialog>
      
    </Box>
  );
}
