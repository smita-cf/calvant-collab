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
  Fade,
  Switch,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export default function DatasheetContent() {
  const navigate = useNavigate();
  const [datasheets, setDatasheets] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://api.calvant.com/blog-service/api/datasheets";

  const fetchDatasheets = async () => {
    try {
      setLoading(true);
      // Admin list includes drafts, unlike the public /api/datasheets endpoint
      const res = await fetch(`${API_BASE}/admin/all`);
      const data = await res.json();
      setDatasheets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch datasheets:", error);
      setDatasheets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasheets();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this datasheet? This also removes its PDF and thumbnail from S3.")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDatasheets((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleTogglePublish = async (datasheet) => {
    const nextPublished = !datasheet.published;
    // Optimistic update so the switch feels instant
    setDatasheets((prev) =>
      prev.map((d) => (d.id === datasheet.id ? { ...d, published: nextPublished } : d))
    );

    try {
      const res = await fetch(`${API_BASE}/${datasheet.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: nextPublished }),
      });
      if (!res.ok) throw new Error("Publish toggle failed");
    } catch (error) {
      console.error(error);
      // Roll back on failure
      setDatasheets((prev) =>
        prev.map((d) => (d.id === datasheet.id ? { ...d, published: !nextPublished } : d))
      );
      alert("Couldn't update publish status. Please try again.");
    }
  };

  const handleReorder = async (index, direction) => {
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= datasheets.length) return;

    const reordered = [...datasheets];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];

    // Reassign sortOrder to match the new array position
    const withNewOrder = reordered.map((d, i) => ({ ...d, sortOrder: i }));
    setDatasheets(withNewOrder);

    try {
      const res = await fetch(`${API_BASE}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: withNewOrder.map((d) => ({ id: d.id, sortOrder: d.sortOrder })),
        }),
      });
      if (!res.ok) throw new Error("Reorder failed");
    } catch (error) {
      console.error(error);
      fetchDatasheets(); // resync with server on failure
    }
  };

  return (
    <Box sx={{ p: 4, width: '100%', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

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
          Datasheet Manager
        </Typography>

        <Button
          variant="contained"
          startIcon={<NoteAddIcon />}
          onClick={() => navigate('/datasheets/content/add')}
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
          Add Datasheet
        </Button>
      </Box>

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
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ backgroundColor: 'rgba(240, 244, 248, 0.7)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Order</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Thumbnail</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Badge</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>PDF</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#455a64' }}>Published</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#455a64' }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={40} thickness={4} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
                    Fetching datasheets...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : datasheets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="text.secondary" fontWeight="light">
                    No datasheets yet. Add your first one!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              datasheets.map((sheet, index) => (
                <TableRow
                  key={sheet.id}
                  hover
                  sx={{ transition: '0.2s ease', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <IconButton size="small" disabled={index === 0} onClick={() => handleReorder(index, -1)}>
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" disabled={index === datasheets.length - 1} onClick={() => handleReorder(index, 1)}>
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>

                  <TableCell>
                    {sheet.thumbnailUrl ? (
                      <Box
                        component="img"
                        src={sheet.thumbnailUrl}
                        alt="thumbnail"
                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">No thumbnail</Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                      {sheet.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {sheet.subtitle}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={sheet.badgeLabel}
                      size="small"
                      sx={{
                        color: sheet.badgeColor,
                        backgroundColor: sheet.badgeBg,
                        fontWeight: 700
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {sheet.pdfUrl ? (
                      <Tooltip title="Open current PDF">
                        <IconButton size="small" component="a" href={sheet.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <PictureAsPdfIcon fontSize="small" sx={{ color: '#ef4444' }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.disabled">Missing</Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Switch
                      checked={!!sheet.published}
                      onChange={() => handleTogglePublish(sheet)}
                      color="success"
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Edit Datasheet" TransitionComponent={Fade}>
                      <IconButton
                        onClick={() => navigate(`/datasheets/content/edit/${sheet.id}`)}
                        sx={{ color: '#1976d2', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }, mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Permanently" TransitionComponent={Fade}>
                      <IconButton
                        onClick={() => handleDelete(sheet.id)}
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