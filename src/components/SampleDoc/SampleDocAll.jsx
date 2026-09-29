import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Tooltip,
  Skeleton,
  TextField,
  InputAdornment,
  Stack
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'

const BASE_URL = 'https://api.calvant.com/docs/api/docs'

/* ================= NORMALIZER ================= */
// Fixed to handle the array of objects provided in your sample
const normalizeDocsResponse = (data) => {
  if (!Array.isArray(data)) return []
  return data.map((item) => ({
    id: item.id,
    clause: item.clause || 'N/A',
    type: item.type || [],
    dept: item.dept || [],
    docs: item.docs || [],
    updatedAt: item.updatedAt
  }))
}

function SampleDocAll() {
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [confirmText, setConfirmText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDocs()
  }, [])

  /* ================= FETCH ================= */
  const fetchDocs = async () => {
    setLoading(true)
    try {
      const res = await axios.get(BASE_URL)
      // Check if res.data is the array directly or wrapped in an object
      const dataToNormalize = Array.isArray(res.data) ? res.data : res.data?.data || []
      setRows(normalizeDocsResponse(dataToNormalize))
    } catch (err) {
      console.error('Failed to fetch docs', err)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  /* ================= HELPERS ================= */
  const toArray = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      return val.split(',').map(v => v.trim()).filter(Boolean)
    }
    return []
  }

  /* ================= SEARCH ================= */
  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows
    const q = searchQuery.toLowerCase()

    return rows.filter(row =>
      String(row.clause).toLowerCase().includes(q) ||
      toArray(row.type).some(v => v.toLowerCase().includes(q)) ||
      toArray(row.dept).some(v => v.toLowerCase().includes(q)) ||
      toArray(row.docs).some(v => v.toLowerCase().includes(q))
    )
  }, [rows, searchQuery])

  /* ================= PAGINATION ================= */
  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  /* ================= CSV EXPORT ================= */
  const exportToCSV = () => {
    const headers = ['Clause', 'Type', 'Department', 'Documents']
    const csvRows = filteredRows.map(row => [
      row.clause,
      toArray(row.type).join('; '),
      toArray(row.dept).join('; '),
      toArray(row.docs).join('; ')
    ])

    const csvContent = headers.join(',') + '\n' + 
      csvRows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `docs_export_${new Date().toLocaleDateString()}.csv`)
    link.click()
  }

  /* ================= ACTIONS ================= */
  const handleEdit = (id) => navigate(`/doc/doc_edit/${id}`)
  
  const handleOpenDelete = (id) => {
    setDeleteTarget(id)
    setConfirmText('')
    setOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/${deleteTarget}`)
      setOpen(false)
      setConfirmText('')
      fetchDocs() // Refresh list
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
        Poliecies list
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />} 
          onClick={exportToCSV}
          disabled={loading || rows.length === 0}
        >
          Export CSV
        </Button>
      </Stack>

      <TextField
        fullWidth
        size="small"
        placeholder="Search by Clause, Type, Dept or Document name..."
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{ mb: 3, maxWidth: 500, bgcolor: 'white' }}
      />

      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Clause</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Documents</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}><Skeleton variant="text" height={40} /></TableCell>
                  </TableRow>
                ))
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary">No documents found matching your criteria.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.clause}</TableCell>
                      <TableCell>{toArray(row.type).join(', ') || '—'}</TableCell>
                      <TableCell>{toArray(row.dept).join(', ') || '—'}</TableCell>
                      <TableCell>{toArray(row.docs).join(', ') || '—'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleEdit(row.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleOpenDelete(row.id)}>
                            <DeleteIcon fontSize="small" />
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
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); setConfirmText('') }}>
        <DialogTitle>Confirm Permanent Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action cannot be undone. Type <strong>confirm</strong> below to enable the delete button.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Type confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setOpen(false); setConfirmText('') }}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={confirmText !== 'confirm'}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SampleDocAll