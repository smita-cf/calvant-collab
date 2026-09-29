import React, { useState, useRef } from "react";
import axios from "axios";
import Papa from "papaparse";
import { captureActivity, ACTIONS } from "../../services/activities";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Chip,
  Stack,
  Snackbar,
  Alert
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const API_URL = "https://api.calvant.com/user-service/api/users";

// Motion components
const MotionBox = motion(Box);
const MotionTableRow = motion(TableRow);

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
}));

const UploadButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  height: "44px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#ffffff",
  textTransform: "none",
  background: "#3b82f6",
  "&:hover": {
    background: "#2563eb",
  },
  "&:disabled": {
    background: "#e5e7eb",
  }
}));

const ToggleButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  height: "44px",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "none",
  background: "#f1f5f9",
  color: "#475569",
  "&:hover": {
    background: "#e2e8f0",
  }
}));

const FileInputWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  padding: theme.spacing(4),
  border: "2px dashed #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#3b82f6",
    backgroundColor: "#f8fafc",
  },
  "&.dragging": {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
  minWidth: "150px",
  "&:focus": {
    outline: "2px solid #3b82f6",
    outlineOffset: "-2px",
    backgroundColor: "#eff6ff"
  }
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: "#f8fafc",
  fontWeight: 600,
  fontSize: "13px",
  color: "#475569",
  borderBottom: "1px solid #cbd5e1",
  position: "sticky",
  top: 0,
  zIndex: 10
}));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1
    }
  }
};

const rowVariants = {
  hidden: {
    opacity: 0,
    x: -10
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2
    }
  }
};

function BulkUser() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragRowIndex, setDragRowIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(true);
  const [fileName, setFileName] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);

  /* ================= RESET STATE ================= */
  const resetState = () => {
    setRows([]);
    setDragRowIndex(null);
    setIsDragging(false);
    setIsFileDragging(false);
    setShowUploadSection(true);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ================= FILE LOAD ================= */

  const parseFile = (file) => {
    if (!file) return;

    // Reset state before parsing new file
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (res.data && res.data.length > 0) {
          // Filter out __parsed_extra and other unwanted fields
          const cleanedData = res.data.map(row => {
            const cleanRow = {};
            Object.keys(row).forEach(key => {
              // Only include fields that don't start with __parsed
              if (!key.startsWith('__parsed')) {
                cleanRow[key] = row[key];
              }
            });
            return cleanRow;
          });
          setRows(cleanedData);
          // Hide upload section after loading file
          setShowUploadSection(false);
          setSnackbar({
            open: true,
            message: `Successfully loaded ${cleanedData.length} rows from ${file.name}`,
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'No data found in the file',
            severity: 'warning'
          });
        }
      },
      error: (error) => {
        console.error('Parse error:', error);
        setSnackbar({
          open: true,
          message: 'Failed to parse CSV file',
          severity: 'error'
        });
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // If rows already exist, user is reloading
      if (rows.length > 0) {
        const confirmReload = window.confirm(
          'You have unsaved data. Loading a new file will replace the current data. Continue?'
        );
        if (!confirmReload) {
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
      }
      parseFile(file);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleReloadFile = () => {
    resetState();
    setSnackbar({
      open: true,
      message: 'Ready to load a new file',
      severity: 'info'
    });
  };

  // Drag and drop for file upload
  const handleFileDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragging(true);
  };

  const handleFileDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragging(false);
  };

  const handleFileDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // If rows already exist, confirm before replacing
      if (rows.length > 0) {
        const confirmReload = window.confirm(
          'You have unsaved data. Loading a new file will replace the current data. Continue?'
        );
        if (!confirmReload) return;
      }
      parseFile(files[0]);
    }
  };

  /* ================= EDIT ================= */

  const handleCellChange = (rowIndex, key, value) => {
    const updated = [...rows];
    updated[rowIndex][key] = value;
    setRows(updated);
  };

  const handleDeleteRow = (rowIndex) => {
    const updated = rows.filter((_, idx) => idx !== rowIndex);
    setRows(updated);
    setSnackbar({
      open: true,
      message: 'Row deleted',
      severity: 'info'
    });
  };

  /* ================= ROW DRAG ================= */

  const handleDragStart = (index) => {
    setDragRowIndex(index);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrop = (dropIndex) => {
    if (dragRowIndex === null || dragRowIndex === dropIndex) return;

    const updated = [...rows];
    const moved = updated.splice(dragRowIndex, 1)[0];
    updated.splice(dropIndex, 0, moved);

    setRows(updated);
    setDragRowIndex(null);
  };

  /* ================= UPLOAD ================= */

  const handleUpload = async () => {
    if (!rows.length) {
      setSnackbar({
        open: true,
        message: 'No data to upload',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);

    try {
      // Use Papa.unparse to convert rows back to CSV
      const csvContent = Papa.unparse(rows);

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'bulk_users.csv', { type: 'text/csv' });

      const formData = new FormData();
      formData.append('file', file);

      // POST to the users bulk upload endpoint
      await axios.post(
        'https://api.calvant.com/user-service/api/users/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSnackbar({
        open: true,
        message: 'Bulk users uploaded successfully ✅',
        severity: 'success'
      });

      // ── Activity log: BULK_FILE ──────────────────────────────────
      captureActivity({
        action: "BULK_FILE",
        item: [{ file: fileName, rows: rows.length, type: "bulk_users", status: "created" }],
      });

      // Reset state after successful upload and hide upload view
      setTimeout(() => {
        resetState();
      }, 1500);

    } catch (err) {
      console.error('Upload failed:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Upload failed ❌',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div>
      <Box
        sx={{
          p: 3,
          maxWidth: 1400,
          margin: "auto",
          minHeight: "100vh",
          backgroundColor: "#ffffff"
        }}
      >
        <StyledPaper elevation={0}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
                mb: 0.5
              }}
            >
              Bulk Users Upload
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                mb: 2
              }}
            >
              Upload and edit multiple users at once via CSV file
            </Typography>

            {/* Tip Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 2,
                backgroundColor: '#eff6ff',
                borderLeft: '4px solid #3b82f6',
                borderRadius: '4px'
              }}
            >
              <InfoOutlinedIcon sx={{ color: '#3b82f6', fontSize: 20, mt: 0.2 }} />
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#1e40af',
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  💡 Pro Tip: Multiple Values
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#1e40af',
                    fontSize: '13px'
                  }}
                >
                  To add multiple <strong>Roles</strong> or <strong>Departments</strong> in a single row,
                  separate them with a <strong>semicolon (;)</strong>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#1e40af',
                    fontSize: '12px',
                    display: 'block',
                    mt: 0.5,
                    fontStyle: 'italic'
                  }}
                >
                  Example: "Admin; Manager" or "IT; HR; Finance"
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* File Upload Section */}
          <AnimatePresence>
            {showUploadSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />

                  <FileInputWrapper
                    className={isFileDragging ? "dragging" : ""}
                    onClick={handleFileInputClick}
                    onDragEnter={handleFileDragEnter}
                    onDragLeave={handleFileDragLeave}
                    onDragOver={handleFileDragOver}
                    onDrop={handleFileDrop}
                    component={motion.div}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <CloudUploadIcon
                      sx={{ fontSize: 48, color: "#3b82f6", mb: 1 }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b", mb: 0.5 }}>
                      {fileName ? "Re-upload CSV file" : "Click to upload CSV file"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", fontSize: "13px" }}>
                      or drag and drop your file here
                    </Typography>
                    {fileName && (
                      <Typography variant="caption" sx={{ color: "#3b82f6", mt: 1, display: 'block' }}>
                        Current file: {fileName}
                      </Typography>
                    )}
                  </FileInputWrapper>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats and Upload Button */}
          {rows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={`${rows.length} rows loaded`}
                    size="small"
                    sx={{
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      fontWeight: 600,
                      fontSize: "13px"
                    }}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ToggleButton
                      onClick={() => setShowUploadSection(!showUploadSection)}
                      startIcon={showUploadSection ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      size="small"
                      sx={{ height: "32px" }}
                    >
                      {showUploadSection ? "Hide" : "Show"} Upload
                    </ToggleButton>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ToggleButton
                      onClick={handleReloadFile}
                      startIcon={<RefreshIcon />}
                      size="small"
                      sx={{ height: "32px" }}
                    >
                      Reload New File
                    </ToggleButton>
                  </motion.div>
                </Stack>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UploadButton
                    onClick={handleUpload}
                    disabled={loading || rows.length === 0}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
                  >
                    {loading ? "Uploading..." : "Upload All to Database"}
                  </UploadButton>
                </motion.div>
              </Stack>
            </motion.div>
          )}

          {/* Editable Table */}
          <AnimatePresence>
            {rows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
              >
                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: "8px",
                    maxHeight: 600,
                    overflow: "auto",
                    border: "1px solid #e5e7eb"
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <StyledTableHeadCell sx={{ width: 40 }}>
                          <DragIndicatorIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                        </StyledTableHeadCell>
                        {Object.keys(rows[0]).map((key) => (
                          <StyledTableHeadCell key={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </StyledTableHeadCell>
                        ))}
                        <StyledTableHeadCell sx={{ width: 60 }}>
                          Actions
                        </StyledTableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody
                      component={motion.tbody}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {rows.map((row, rowIndex) => (
                        <MotionTableRow
                          key={rowIndex}
                          variants={rowVariants}
                          draggable
                          onDragStart={() => handleDragStart(rowIndex)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(rowIndex)}
                          sx={{
                            cursor: "move",
                            backgroundColor: dragRowIndex === rowIndex ? "#eff6ff" : "transparent",
                            opacity: dragRowIndex === rowIndex && isDragging ? 0.5 : 1,
                            "&:hover": {
                              backgroundColor: "#f8fafc"
                            }
                          }}
                        >
                          <StyledTableCell>
                            <DragIndicatorIcon sx={{ color: "#cbd5e1", cursor: "grab", fontSize: 18 }} />
                          </StyledTableCell>
                          {Object.keys(row).map((key) => (
                            <StyledTableCell
                              key={key}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                handleCellChange(rowIndex, key, e.target.innerText)
                              }
                            >
                              {row[key]}
                            </StyledTableCell>
                          ))}
                          <StyledTableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRow(rowIndex)}
                              sx={{
                                color: "#ef4444",
                                padding: "4px",
                                "&:hover": {
                                  backgroundColor: "#fee2e2"
                                }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </StyledTableCell>
                        </MotionTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 2,
                    color: "#94a3b8",
                    fontSize: "12px"
                  }}
                >
                  💡 Tip: Click cells to edit, drag rows to reorder, or click delete to remove
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </StyledPaper>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </div>
  );
}

export default BulkUser;