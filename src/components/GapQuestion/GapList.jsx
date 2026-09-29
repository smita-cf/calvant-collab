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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  Typography,
  Tooltip,
  Skeleton,
  TextField,
  InputAdornment,
  Checkbox
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import axios from 'axios'

const BASE_URL = 'https://api.calvant.com/gap-questions/api/gaps'

// Default column widths
const DEFAULT_COLUMN_WIDTHS = {
  clause: 80,
  standardRequirement: 350,
  auditQuestions: 400,
  department: 200,
  actions: 100
}

function GapList() {
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [loading, setLoading] = useState(true)

  // Delete dialog (single)
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Bulk delete dialog
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkConfirmText, setBulkConfirmText] = useState('')
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Batch selection
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Global search
  const [searchQuery, setSearchQuery] = useState('')

  // Column widths state
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('gapListColumnWidths')
    return saved ? JSON.parse(saved) : DEFAULT_COLUMN_WIDTHS
  })

  // Resizing state
  const [resizing, setResizing] = useState(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [hoveredResizer, setHoveredResizer] = useState(null)

  useEffect(() => {
    fetchGaps()
  }, [])

  // Save column widths to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gapListColumnWidths', JSON.stringify(columnWidths))
  }, [columnWidths])

  const fetchGaps = async () => {
    setLoading(true)
    try {
      const res = await axios.get(BASE_URL)
      setRows(res.data || [])
      setSelectedIds(new Set())
    } catch (err) {
      console.error('Failed to fetch gaps', err)
    } finally {
      setLoading(false)
    }
  }

  // Global search filter
  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows

    return rows.filter(row => {
      const searchLower = searchQuery.toLowerCase()
      
      if (row.clause && String(row.clause).toLowerCase().includes(searchLower)) return true
      if (row.standardRequirement && String(row.standardRequirement).toLowerCase().includes(searchLower)) return true
      
      if (row.auditQuestions) {
        const questions = Array.isArray(row.auditQuestions)
          ? row.auditQuestions.join(' ')
          : String(row.auditQuestions)
        if (questions.toLowerCase().includes(searchLower)) return true
      }
      
      if (row.department) {
        const dept = Array.isArray(row.department)
          ? row.department.join(' ')
          : String(row.department)
        if (dept.toLowerCase().includes(searchLower)) return true
      }
      
      return false
    })
  }, [rows, searchQuery])

  // Rows currently visible on this page
  const pageRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  )

  // ─── Selection helpers ────────────────────────────────────────────────────
  const getRowId = (row) => row.id || row._id

  const isAllPageSelected =
    pageRows.length > 0 && pageRows.every(r => selectedIds.has(getRowId(r)))

  const isSomePageSelected =
    pageRows.some(r => selectedIds.has(getRowId(r))) && !isAllPageSelected

  const handleSelectAll = (e) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (e.target.checked) {
        pageRows.forEach(r => next.add(getRowId(r)))
      } else {
        pageRows.forEach(r => next.delete(getRowId(r)))
      }
      return next
    })
  }

  const handleSelectRow = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ─── Pagination ───────────────────────────────────────────────────────────
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // ─── Export ───────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    const headers = [
      'ID', 'Clause/ Control Number', 'Standard Requirement', 'Audit Questions', 'Department'
    ]

    const csvRows = filteredRows.map(row => {
      const values = [
        row.id || row._id,
        row.clause,
        row.standardRequirement,
        Array.isArray(row.auditQuestions) ? row.auditQuestions.join('; ') : row.auditQuestions,
        Array.isArray(row.department) ? row.department.join('; ') : row.department
      ]

      const formattedValues = values.map(val => {
        const str = String(val ?? '')
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })

      return formattedValues.join(',')
    })
    
    const csvContent = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `gap_questions_${new Date().toISOString().slice(0,10)}.csv`)
    link.click()
  }

  // ─── Single delete ────────────────────────────────────────────────────────
  const handleEdit = (id) => {
    navigate(`/gap/edit/${id}`)
  }

  const handleOpenDelete = (id) => {
    setDeleteTarget(id)
    setOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/${deleteTarget}`)
      setOpen(false)
      fetchGaps()
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  // ─── Bulk delete ──────────────────────────────────────────────────────────
  const handleOpenBulkDelete = () => {
    setBulkConfirmText('')
    setBulkDeleteOpen(true)
  }

  const handleBulkDelete = async () => {
    if (bulkConfirmText !== 'confirm') return
    setBulkDeleting(true)
    try {
      await Promise.all(
        [...selectedIds].map(id => axios.delete(`${BASE_URL}/${id}`))
      )
      setBulkDeleteOpen(false)
      fetchGaps()
    } catch (err) {
      console.error(err)
      alert('Bulk delete failed. Some items may not have been deleted.')
    } finally {
      setBulkDeleting(false)
    }
  }

  // ─── Utility ──────────────────────────────────────────────────────────────
  const toArray = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string')
      return val.split(',').map(v => v.trim()).filter(Boolean)
    return []
  }

  const renderDepartmentChips = (deptArr) => {
    const departments = toArray(deptArr)

    if (!departments.length) {
      return <Typography variant="caption">-</Typography>
    }

    const visible = departments.slice(0, 3)
    const overflow = departments.slice(3)

    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {visible.map((dept, idx) => (
          <Chip 
            key={idx} 
            label={dept} 
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              fontWeight: 500
            }}
          />
        ))}

        {overflow.length > 0 && (
          <Tooltip title={overflow.join(', ')}>
            <Chip
              label={`+${overflow.length} more`}
              size="small"
              color="primary"
            />
          </Tooltip>
        )}
      </Box>
    )
  }

  const renderAuditQuestions = (questions) => {
    if (Array.isArray(questions)) {
      return questions.join(', ')
    }
    return questions || '-'
  }

  // ─── Column resizing ──────────────────────────────────────────────────────
  const handleMouseDown = (columnName, e) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(columnName)
    setStartX(e.clientX)
    setStartWidth(columnWidths[columnName])
  }

  const handleMouseMove = (e) => {
    if (!resizing) return
    const diff = e.clientX - startX
    const newWidth = Math.max(60, startWidth + diff)
    setColumnWidths(prev => ({ ...prev, [resizing]: newWidth }))
  }

  const handleMouseUp = () => {
    setResizing(null)
  }

  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [resizing, startX, startWidth])

  const resetColumnWidths = () => {
    setColumnWidths(DEFAULT_COLUMN_WIDTHS)
    localStorage.removeItem('gapListColumnWidths')
  }

  // ─── Sub-components ───────────────────────────────────────────────────────
  const SkeletonRows = () => (
    <>
      {[...Array(10)].map((_, index) => (
        <TableRow key={index}>
          <TableCell sx={{ width: 48 }}>
            <Skeleton variant="rectangular" width={18} height={18} />
          </TableCell>
          <TableCell
            sx={{
              position: 'sticky',
              left: 48,
              backgroundColor: 'white',
              zIndex: 1,
              width: columnWidths.clause,
              maxWidth: columnWidths.clause
            }}
          >
            <Skeleton variant="text" width="80%" height={24} />
          </TableCell>
          <TableCell sx={{ width: columnWidths.standardRequirement, maxWidth: columnWidths.standardRequirement }}>
            <Skeleton variant="text" width="90%" height={24} />
            <Skeleton variant="text" width="70%" height={20} />
          </TableCell>
          <TableCell sx={{ width: columnWidths.auditQuestions, maxWidth: columnWidths.auditQuestions }}>
            <Skeleton variant="text" width="95%" height={24} />
            <Skeleton variant="text" width="85%" height={20} />
          </TableCell>
          <TableCell sx={{ width: columnWidths.department, maxWidth: columnWidths.department }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={60} height={24} />
            </Box>
          </TableCell>
          <TableCell
            align="center"
            sx={{
              position: 'sticky',
              right: 0,
              backgroundColor: 'white',
              zIndex: 1,
              width: columnWidths.actions,
              maxWidth: columnWidths.actions
            }}
          >
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  )

  const ColumnResizer = ({ columnName }) => (
    <Box
      sx={{
        width: '16px',
        height: '100%',
        position: 'absolute',
        right: '-8px',
        top: 0,
        cursor: 'col-resize',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
      onMouseDown={(e) => handleMouseDown(columnName, e)}
      onMouseEnter={() => setHoveredResizer(columnName)}
      onMouseLeave={() => setHoveredResizer(null)}
    >
      <Box
        sx={{
          width: '2px',
          height: hoveredResizer === columnName || resizing === columnName ? '70%' : '50%',
          backgroundColor: hoveredResizer === columnName || resizing === columnName
            ? '#94a3b8'
            : '#d1d5db',
          borderRadius: '1px',
          transition: 'all 0.15s ease',
          pointerEvents: 'none'
        }}
      />
    </Box>
  )

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <Typography variant="h5" sx={{ p: 2, pb: 1 }}>
        Gap Assessment List
      </Typography>

      {/* Search Bar and Action Buttons */}
      <Box sx={{ px: 2, pb: 1, pt: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          {/* Global Search */}
          <Box sx={{ flex: 1 }}>
            <TextField
              size="small"
              placeholder="Search across all columns..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                width: '100%',
                maxWidth: 500,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white'
                }
              }}
            />
            {searchQuery && (
              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary', display: 'inline-block', mt: 0.5 }}>
                Showing {filteredRows.length} of {rows.length} results
              </Typography>
            )}
          </Box>

          {/* Header Actions */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Bulk Delete Button — visible when rows are selected */}
            {selectedIds.size > 0 && (
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<DeleteSweepIcon />}
                onClick={handleOpenBulkDelete}
                sx={{ height: '35px' }}
              >
                Delete Selected ({selectedIds.size})
              </Button>
            )}

            <Tooltip title="Reset Column Widths" placement="top">
              <Button
                variant="contained"
                size="small"
                color="inherit"
                onClick={resetColumnWidths}
                sx={{ height: '35px' }}
              >
                <RotateLeftIcon />
              </Button>
            </Tooltip>

            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              disabled={loading}
              sx={{ height: '35px' }}
            >
              Export CSV
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: '70vh', overflowX: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {/* Checkbox Column Header */}
                  <TableCell
                    padding="checkbox"
                    sx={{
                      position: 'sticky',
                      left: 0,
                      top: 0,
                      backgroundColor: '#f5f5f5',
                      zIndex: 4,
                      width: 48,
                      minWidth: 48,
                      borderRight: '1px solid #e0e0e0'
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={isAllPageSelected}
                      indeterminate={isSomePageSelected}
                      onChange={handleSelectAll}
                      disabled={loading || pageRows.length === 0}
                    />
                  </TableCell>

                  {/* Clause Column */}
                  <TableCell
                    sx={{
                      width: columnWidths.clause,
                      minWidth: columnWidths.clause,
                      maxWidth: columnWidths.clause,
                      position: 'sticky',
                      left: 48,
                      top: 0,
                      backgroundColor: '#f5f5f5',
                      zIndex: 3,
                      fontWeight: 600,
                      borderRight: '1px solid #e0e0e0',
                      userSelect: 'none',
                      padding: '12px 8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      Clause
                      <ColumnResizer columnName="clause" />
                    </Box>
                  </TableCell>

                  {/* Standard Requirement Column */}
                  <TableCell
                    sx={{
                      backgroundColor: '#f5f5f5',
                      width: columnWidths.standardRequirement,
                      minWidth: columnWidths.standardRequirement,
                      maxWidth: columnWidths.standardRequirement,
                      fontWeight: 600,
                      position: 'relative',
                      userSelect: 'none',
                      padding: '12px 8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      Standard Requirement
                      <ColumnResizer columnName="standardRequirement" />
                    </Box>
                  </TableCell>

                  {/* Audit Questions Column */}
                  <TableCell
                    sx={{
                      backgroundColor: '#f5f5f5',
                      width: columnWidths.auditQuestions,
                      minWidth: columnWidths.auditQuestions,
                      maxWidth: columnWidths.auditQuestions,
                      fontWeight: 600,
                      position: 'relative',
                      userSelect: 'none',
                      padding: '12px 8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      Audit Questions
                      <ColumnResizer columnName="auditQuestions" />
                    </Box>
                  </TableCell>

                  {/* Department Column */}
                  <TableCell
                    sx={{
                      backgroundColor: '#f5f5f5',
                      width: columnWidths.department,
                      minWidth: columnWidths.department,
                      maxWidth: columnWidths.department,
                      fontWeight: 600,
                      position: 'relative',
                      userSelect: 'none',
                      padding: '12px 8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      Department
                      <ColumnResizer columnName="department" />
                    </Box>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell
                    align="center"
                    sx={{
                      width: columnWidths.actions,
                      minWidth: columnWidths.actions,
                      maxWidth: columnWidths.actions,
                      position: 'sticky',
                      right: 0,
                      top: 0,
                      backgroundColor: '#f5f5f5',
                      zIndex: 3,
                      fontWeight: 600,
                      borderLeft: '1px solid #e0e0e0',
                      padding: '12px 8px',
                      fontSize: '13px'
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <SkeletonRows />
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        {searchQuery ? 'No results found' : 'No gap questions found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((row) => {
                    const rowId = getRowId(row)
                    const isSelected = selectedIds.has(rowId)
                    return (
                      <TableRow
                        key={rowId}
                        hover
                        selected={isSelected}
                        sx={isSelected ? { backgroundColor: '#e8f0fe !important' } : {}}
                      >
                        {/* Checkbox Cell */}
                        <TableCell
                          padding="checkbox"
                          sx={{
                            position: 'sticky',
                            left: 0,
                            backgroundColor: isSelected ? '#e8f0fe' : 'white',
                            zIndex: 1,
                            width: 48,
                            minWidth: 48,
                            borderRight: '1px solid #e0e0e0'
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowId)}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            width: columnWidths.clause,
                            minWidth: columnWidths.clause,
                            maxWidth: columnWidths.clause,
                            position: 'sticky',
                            left: 48,
                            backgroundColor: isSelected ? '#e8f0fe' : 'white',
                            zIndex: 1,
                            fontWeight: 'bold',
                            borderRight: '1px solid #e0e0e0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            padding: '8px',
                            fontSize: '12px'
                          }}
                        >
                          <Tooltip title={row.clause || '-'} placement="top-start">
                            <span>{row.clause || '-'}</span>
                          </Tooltip>
                        </TableCell>

                        <TableCell
                          sx={{
                            width: columnWidths.standardRequirement,
                            minWidth: columnWidths.standardRequirement,
                            maxWidth: columnWidths.standardRequirement,
                            overflow: 'hidden',
                            padding: '8px',
                            fontSize: '12px'
                          }}
                        >
                          {row.standardRequirement || '-'}
                        </TableCell>

                        <TableCell
                          sx={{
                            width: columnWidths.auditQuestions,
                            minWidth: columnWidths.auditQuestions,
                            maxWidth: columnWidths.auditQuestions,
                            overflow: 'hidden',
                            padding: '8px',
                            fontSize: '12px'
                          }}
                        >
                          {renderAuditQuestions(row.auditQuestions)}
                        </TableCell>

                        <TableCell
                          sx={{
                            width: columnWidths.department,
                            minWidth: columnWidths.department,
                            maxWidth: columnWidths.department,
                            overflow: 'hidden',
                            padding: '8px',
                            fontSize: '12px'
                          }}
                        >
                          {renderDepartmentChips(row.department)}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            width: columnWidths.actions,
                            minWidth: columnWidths.actions,
                            maxWidth: columnWidths.actions,
                            position: 'sticky',
                            right: 0,
                            backgroundColor: isSelected ? '#e8f0fe' : 'white',
                            zIndex: 1,
                            borderLeft: '1px solid #e0e0e0',
                            padding: '8px'
                          }}
                        >
                          <IconButton size="small" color="primary" onClick={() => handleEdit(rowId)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleOpenDelete(rowId)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[25, 100, 500, 1000]}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* ── Single Delete Dialog ───────────────────────────────────── */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this gap question? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Bulk Delete Dialog ─────────────────────────────────────── */}
        <Dialog
          open={bulkDeleteOpen}
          onClose={() => !bulkDeleting && setBulkDeleteOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>
            Delete {selectedIds.size} selected item{selectedIds.size !== 1 ? 's' : ''}?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              This will permanently delete <strong>{selectedIds.size}</strong> gap question
              {selectedIds.size !== 1 ? 's' : ''}. This action <strong>cannot be undone</strong>.
            </DialogContentText>
            <DialogContentText sx={{ mb: 1.5, fontSize: '0.9rem' }}>
              Type <strong>confirm</strong> below to proceed:
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="Type confirm to delete"
              value={bulkConfirmText}
              onChange={(e) => setBulkConfirmText(e.target.value)}
              error={bulkConfirmText.length > 0 && bulkConfirmText !== 'confirm'}
              helperText={
                bulkConfirmText.length > 0 && bulkConfirmText !== 'confirm'
                  ? 'Please type "confirm" exactly'
                  : ''
              }
              sx={{
                '& .MuiOutlinedInput-root': { backgroundColor: 'white' }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkDeleteOpen(false)} disabled={bulkDeleting}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleBulkDelete}
              disabled={bulkConfirmText !== 'confirm' || bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size} item${selectedIds.size !== 1 ? 's' : ''}`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  )
}

export default GapList
