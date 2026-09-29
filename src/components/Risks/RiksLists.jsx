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
import FilterListOffIcon from '@mui/icons-material/FilterListOff'
import axios from 'axios'

const BASE_URL = 'https://api.calvant.com/risk-template-service/api/risks'

// Default column widths (you can adjust these as needed)
const DEFAULT_COLUMN_WIDTHS = {
  riskId: 150,
  department: 150,
  date: 120,
  riskType: 150,
  assetType: 150,
  asset: 150,
  description: 250,
  confidentiality: 120,
  integrity: 100,
  availability: 100,
  probability: 100,
  existingControls: 180,
  additionalNotes: 180,
  controlRef: 120,
  additionalControls: 180,
  days: 80,
  deadline: 120,
  status: 100,
  riskScore: 100,
  riskLevel: 100,
  likelihoodPost: 130,
  impactPost: 120,
  createdAt: 120,
  updatedAt: 120,
  actions: 100
}

const renderStatusChip = (status) => {
  let bg = '#f1f5f9', color = '#64748b';
  if (status?.toLowerCase() === 'open') { bg = '#fee2e2'; color = '#ef4444'; }
  else if (status?.toLowerCase() === 'closed') { bg = '#dcfce7'; color = '#22c55e'; }
  else if (status?.toLowerCase() === 'in progress') { bg = '#fef3c7'; color = '#f59e0b'; }
  
  return (
    <Chip
      label={status || 'N/A'}
      size="small"
      sx={{
        backgroundColor: bg,
        color: color,
        fontWeight: 600,
        borderRadius: '6px',
        height: '24px',
        border: 'none',
      }}
    />
  );
};

const renderRiskLevel = (level) => {
  let bg = 'transparent', color = 'inherit';
  const lower = level?.toLowerCase();
  if (lower === 'high' || lower === 'critical') { bg = '#fee2e2'; color = '#ef4444'; }
  else if (lower === 'medium') { bg = '#fef3c7'; color = '#f59e0b'; }
  else if (lower === 'low') { bg = '#dcfce7'; color = '#22c55e'; }
  
  if (bg === 'transparent') return level || '-';
  
  return (
    <Box sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 1.5,
      py: 0.5,
      borderRadius: '6px',
      backgroundColor: bg,
      color: color,
      fontWeight: 700,
      fontSize: '11px',
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }}>
      {level}
    </Box>
  );
};

function RisksLists() {
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [loading, setLoading] = useState(true)

  // Filters
  const [riskIdFilter, setRiskIdFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [existingControlFilter, setExistingControlFilter] = useState('')
  const [riskTypeFilter, setRiskTypeFilter] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState('')
  const [assetFilter, setAssetFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Global search
  const [searchQuery, setSearchQuery] = useState('')

  // Delete dialog
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Batch delete state
  const [selected, setSelected] = useState([])
  const [openBatchDelete, setOpenBatchDelete] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [batchDeleting, setBatchDeleting] = useState(false)

  // Column widths state
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('riskListColumnWidths')
    return saved ? JSON.parse(saved) : DEFAULT_COLUMN_WIDTHS
  })

  // Resizing state
  const [resizing, setResizing] = useState(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [hoveredResizer, setHoveredResizer] = useState(null)

  useEffect(() => {
    fetchRisks()
  }, [])

  // Save column widths to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('riskListColumnWidths', JSON.stringify(columnWidths))
  }, [columnWidths])

  const fetchRisks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(BASE_URL)
      setRows(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch risks', err)
    } finally {
      setLoading(false)
    }
  }
  // Create unique lists for dropdowns
  const departments = [...new Set(rows.map(r => r.department).filter(Boolean))]
  const existingControlsList = [...new Set(rows.map(r => r.existingControls).filter(Boolean))]
  const riskTypes = [...new Set(rows.map(r => r.riskType).filter(Boolean))]
  const assetTypes = [...new Set(rows.map(r => r.assetType).filter(Boolean))]
  const assets = [...new Set(rows.map(r => r.asset).filter(Boolean))]

  // Combined filters with global search
  const filteredRows = useMemo(() => {
    let filtered = rows

    // Apply column-specific filters
    filtered = filtered.filter((row) => {
      const matchesId = row.riskId?.toLowerCase().includes(riskIdFilter.toLowerCase())
      const matchesDept = departmentFilter === '' || row.department === departmentFilter
      const matchesControl = existingControlFilter === '' || row.existingControls === existingControlFilter
      const matchesRiskType = riskTypeFilter === '' || row.riskType === riskTypeFilter
      const matchesAssetType = assetTypeFilter === '' || row.assetType === assetTypeFilter
      const matchesAsset = assetFilter === '' || row.asset === assetFilter

      let matchesDate = true
      if (startDate && row.date) matchesDate = matchesDate && row.date >= startDate
      if (endDate && row.date) matchesDate = matchesDate && row.date <= endDate

      return matchesId && matchesDept && matchesControl && matchesRiskType && matchesAssetType && matchesAsset && matchesDate
    })

    // Apply global search
    if (searchQuery) {
      filtered = filtered.filter(row => {
        const searchLower = searchQuery.toLowerCase()
        
        return (
          row.riskId?.toLowerCase().includes(searchLower) ||
          row.department?.toLowerCase().includes(searchLower) ||
          row.riskType?.toLowerCase().includes(searchLower) ||
          row.assetType?.toLowerCase().includes(searchLower) ||
          row.asset?.toLowerCase().includes(searchLower) ||
          row.riskDescription?.toLowerCase().includes(searchLower) ||
          row.existingControls?.toLowerCase().includes(searchLower) ||
          row.status?.toLowerCase().includes(searchLower)
        )
      })
    }

    return filtered
  }, [rows, riskIdFilter, departmentFilter, existingControlFilter, riskTypeFilter, assetTypeFilter, assetFilter, startDate, endDate, searchQuery])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const clearFilters = () => {
    setRiskIdFilter('')
    setDepartmentFilter('')
    setExistingControlFilter('')
    setRiskTypeFilter('')
    setAssetTypeFilter('')
    setAssetFilter('')
    setStartDate('')
    setEndDate('')
    setSearchQuery('')
    setPage(0)
  }

  const exportToCSV = () => {
    const headers = [
      'Risk ID', 'Department', 'Date', 'Risk Type', 'Asset Type', 'Asset',
      'Description', 'Confidentiality', 'Integrity', 'Availability', 'Probability',
      'Existing Controls', 'Additional Notes', 'Control Ref', 'Add. Controls',
      'Days', 'Deadline', 'Status', 'Risk Score', 'Risk Level',
      'Likelihood (Post)', 'Impact (Post)', 'Created At', 'Updated At'
    ]

    const csvRows = filteredRows.map(row => {
      const values = [
        row.riskId,
        row.department,
        row.date,
        row.riskType,
        row.assetType,
        row.asset,
        row.riskDescription,
        row.confidentiality,
        row.integrity,
        row.availability,
        row.probability,
        row.existingControls,
        row.additionalNotes,
        row.controlReference,
        row.additionalControls,
        row.numberOfDays,
        row.deadlineDate,
        row.status,
        row.riskScore,
        row.riskLevel,
        row.likelihoodAfterTreatment,
        row.impactAfterTreatment,
        row.createdAt,
        row.updatedAt
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
    link.setAttribute('download', `risk_report_${new Date().toISOString().slice(0,10)}.csv`)
    link.click()
  }

  const handleEdit = (id) => {
    navigate(`/risks/risk_sample/edit/${id}`)
  }

  const handleOpenDelete = (id) => {
    setDeleteTarget(id)
    setConfirmText('')
    setOpen(true)
  }

  const handleCloseDelete = () => {
    setOpen(false)
    setConfirmText('')
  }

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/${deleteTarget}`)
      setOpen(false)
      setConfirmText('')
      setSelected(prev => prev.filter(id => id !== deleteTarget))
      fetchRisks()
    } catch (err) {
      console.error(err)
      alert('Delete failed')
      setConfirmText('')
    }
  }

  // --- Batch Delete Handlers ---
  const visibleIds = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(r => r._id || r.id || r.riskId)
  const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id))
  const isIndeterminate = visibleIds.some(id => selected.includes(id)) && !isAllVisibleSelected

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(prev => Array.from(new Set([...prev, ...visibleIds])))
    } else {
      setSelected(prev => prev.filter(id => !visibleIds.includes(id)))
    }
  }

  const handleSelectRow = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id])
  }

  const handleOpenBatchDelete = () => {
    setConfirmText('')
    setOpenBatchDelete(true)
  }

  const handleCloseBatchDelete = () => {
    setOpenBatchDelete(false)
    setConfirmText('')
  }

  const handleConfirmBatchDelete = async () => {
    if (confirmText.trim().toLowerCase() !== 'confirm') return
    setBatchDeleting(true)
    try {
      await Promise.all(selected.map(id => axios.delete(`${BASE_URL}/${id}`)))
      setSelected([])
      setOpenBatchDelete(false)
      setConfirmText('')
      fetchRisks()
    } catch (err) {
      console.error(err)
      alert("Batch delete failed")
    } finally {
      setBatchDeleting(false)
    }
  }

  // Column resizing handlers
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

    setColumnWidths(prev => ({
      ...prev,
      [resizing]: newWidth
    }))
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

  // Reset column widths
  const resetColumnWidths = () => {
    setColumnWidths(DEFAULT_COLUMN_WIDTHS)
    localStorage.removeItem('riskListColumnWidths')
  }

  // Resizer component
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

  // Skeleton Loading Component
  const SkeletonRows = () => (
    <>
      {[...Array(10)].map((_, index) => (
        <TableRow key={index}>
          <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1 }}>
            <Skeleton variant="text" width="80%" height={24} />
          </TableCell>
          {Object.keys(DEFAULT_COLUMN_WIDTHS).slice(1, -1).map((key, idx) => (
            <TableCell key={idx}>
              <Skeleton variant="text" width="85%" height={24} />
            </TableCell>
          ))}
          <TableCell align="center" sx={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100%', pt: 1, pb: 4 }}>
      <Typography variant="h5" sx={{ px: 3, py: 2, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
        Risk Assessment Register
      </Typography>

      {/* Search Bar and Action Buttons */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          {/* Global Search */}
          <Box sx={{ flex: 1, width: '100%' }}>
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
                    <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
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
                maxWidth: 480,
                backgroundColor: '#ffffff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                }
              }}
            />
            {searchQuery && (
              <Typography variant="caption" sx={{ ml: 2, color: '#64748b', display: 'inline-block', mt: 0.5, fontWeight: 500 }}>
                Showing {filteredRows.length} of {rows.length} results
              </Typography>
            )}
          </Box>

          {/* Header Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {selected.length > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleOpenBatchDelete}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(239,68,68,0.2)' } }}
              >
                Delete ({selected.length})
              </Button>
            )}
            <Tooltip title='Reset Column Widths' placement='top'>
              <Button
                variant="outlined"
                size="small"
                onClick={resetColumnWidths}
                sx={{ minWidth: 0, width: 38, height: 38, borderRadius: '8px', borderColor: '#e2e8f0', color: '#64748b' }}
              >
                <RotateLeftIcon fontSize="small" /> 
              </Button>
            </Tooltip>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<FilterListOffIcon />} 
              onClick={clearFilters}
              sx={{ height: 38, borderRadius: '8px', textTransform: 'none', fontWeight: 500, borderColor: '#e2e8f0', color: '#475569', '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' } }}
            >
              Clear Filters
            </Button>
            <Button 
              variant="contained" 
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              disabled={loading}
              sx={{ height: 38, borderRadius: '8px', textTransform: 'none', fontWeight: 600, backgroundColor: '#3b82f6', boxShadow: 'none', '&:hover': { backgroundColor: '#2563eb', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' } }}
            >
              Export CSV
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Date Range Filters */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-end">
          <Box>
            <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', mb: 0.5 }}>
              From Date
            </Typography>
            <TextField
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } } }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', mb: 0.5 }}>
              To Date
            </Typography>
            <TextField
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } } }}
            />
          </Box>
        </Stack>
      </Box>
      
      <Box sx={{ px: 3, pb: 2 }}>
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <TableContainer sx={{ maxHeight: '70vh', overflowX: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {/* Checkbox Column */}
                  <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, backgroundColor: '#f8fafc', borderRight: '1px solid #f1f5f9', zIndex: 4, width: '50px' }}>
                    <Checkbox
                      indeterminate={isIndeterminate}
                      checked={isAllVisibleSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>

                  {/* Risk ID Column */}
                  <TableCell
                    sx={{
                      width: columnWidths.riskId,
                      minWidth: columnWidths.riskId,
                      maxWidth: columnWidths.riskId,
                      position: 'sticky',
                      left: 50,
                      backgroundColor: '#f8fafc',
                      zIndex: 3,
                      fontWeight: 600,
                      borderRight: '1px solid #f1f5f9',
                      userSelect: 'none',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Risk ID</Typography>
                      <TextField
                        size="small"
                        placeholder="Search ID..."
                        value={riskIdFilter}
                        onChange={(e) => {
                          setRiskIdFilter(e.target.value)
                          setPage(0)
                        }}
                        sx={{
                          '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
                        }}
                      />
                      <ColumnResizer columnName="riskId" />
                    </Box>
                  </TableCell>

                  {/* Department Column */}
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f8fafc',
                      width: columnWidths.department,
                      minWidth: columnWidths.department,
                      maxWidth: columnWidths.department,
                      fontWeight: 600,
                      position: 'relative',
                      userSelect: 'none',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Department</Typography>
                      <TextField
                        select
                        size="small"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{
                          '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
                        }}
                      >
                        <option value="">All</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </TextField>
                      <ColumnResizer columnName="department" />
                    </Box>
                  </TableCell>

                  {/* Date Column */}
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f8fafc',
                      width: columnWidths.date,
                      minWidth: columnWidths.date,
                      maxWidth: columnWidths.date,
                      fontWeight: 600,
                      position: 'relative',
                      userSelect: 'none',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      Date
                      <ColumnResizer columnName="date" />
                    </Box>
                  </TableCell>

                  {/* Risk Type Column */}
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f8fafc',
                      width: columnWidths.riskType,
                      minWidth: columnWidths.riskType,
                      maxWidth: columnWidths.riskType,
                      fontWeight: 600,
                      position: 'relative',
                      userSelect: 'none',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Risk Type</Typography>
                      <TextField
                        select
                        size="small"
                        value={riskTypeFilter}
                        onChange={(e) => setRiskTypeFilter(e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{
                          '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
                        }}
                      >
                        <option value="">All</option>
                        {riskTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </TextField>
                      <ColumnResizer columnName="riskType" />
                    </Box>
                  </TableCell>

                  {/* Asset Type Column */}
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f8fafc',
                      width: columnWidths.assetType,
                      minWidth: columnWidths.assetType,
                      maxWidth: columnWidths.assetType,
                      fontWeight: 600,
                      position: 'relative',
                      userSelect: 'none',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Asset Type</Typography>
                      <TextField
                        select
                        size="small"
                        value={assetTypeFilter}
                        onChange={(e) => setAssetTypeFilter(e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{
                          '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
                        }}
                      >
                        <option value="">All</option>
                        {assetTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </TextField>
                      <ColumnResizer columnName="assetType" />
                    </Box>
                  </TableCell>

                  {/* Asset Column */}
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f8fafc',
                      width: columnWidths.asset,
                      minWidth: columnWidths.asset,
                      maxWidth: columnWidths.asset,
                      fontWeight: 600,
                      position: 'relative',
                      userSelect: 'none',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Asset</Typography>
                      <TextField
                        select
                        size="small"
                        value={assetFilter}
                        onChange={(e) => setAssetFilter(e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{
                          '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
                        }}
                      >
                        <option value="">All</option>
                        {assets.map((asset) => (
                          <option key={asset} value={asset}>{asset}</option>
                        ))}
                      </TextField>
                      <ColumnResizer columnName="asset" />
                    </Box>
                  </TableCell>

                  {/* Other columns without filters */}
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.description, minWidth: columnWidths.description, maxWidth: columnWidths.description, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Description<ColumnResizer columnName="description" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.confidentiality, minWidth: columnWidths.confidentiality, maxWidth: columnWidths.confidentiality, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Confidentiality<ColumnResizer columnName="confidentiality" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.integrity, minWidth: columnWidths.integrity, maxWidth: columnWidths.integrity, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Integrity<ColumnResizer columnName="integrity" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.availability, minWidth: columnWidths.availability, maxWidth: columnWidths.availability, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Availability<ColumnResizer columnName="availability" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.probability, minWidth: columnWidths.probability, maxWidth: columnWidths.probability, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Probability<ColumnResizer columnName="probability" /></Box>
                  </TableCell>

                  {/* Existing Controls Column with filter */}
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f8fafc',
                      width: columnWidths.existingControls,
                      minWidth: columnWidths.existingControls,
                      maxWidth: columnWidths.existingControls,
                      fontWeight: 600,
                      position: 'relative',
                      userSelect: 'none',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Existing Controls</Typography>
                      <TextField
                        select
                        size="small"
                        value={existingControlFilter}
                        onChange={(e) => setExistingControlFilter(e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{
                          '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
                        }}
                      >
                        <option value="">All</option>
                        {existingControlsList.map((ctrl) => (
                          <option key={ctrl} value={ctrl}>{ctrl}</option>
                        ))}
                      </TextField>
                      <ColumnResizer columnName="existingControls" />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.additionalNotes, minWidth: columnWidths.additionalNotes, maxWidth: columnWidths.additionalNotes, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Additional Notes<ColumnResizer columnName="additionalNotes" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.controlRef, minWidth: columnWidths.controlRef, maxWidth: columnWidths.controlRef, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Control Ref<ColumnResizer columnName="controlRef" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.additionalControls, minWidth: columnWidths.additionalControls, maxWidth: columnWidths.additionalControls, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Add. Controls<ColumnResizer columnName="additionalControls" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.days, minWidth: columnWidths.days, maxWidth: columnWidths.days, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Days<ColumnResizer columnName="days" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.deadline, minWidth: columnWidths.deadline, maxWidth: columnWidths.deadline, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Deadline<ColumnResizer columnName="deadline" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Status<ColumnResizer columnName="status" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.riskScore, minWidth: columnWidths.riskScore, maxWidth: columnWidths.riskScore, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Risk Score<ColumnResizer columnName="riskScore" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.riskLevel, minWidth: columnWidths.riskLevel, maxWidth: columnWidths.riskLevel, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Risk Level<ColumnResizer columnName="riskLevel" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.likelihoodPost, minWidth: columnWidths.likelihoodPost, maxWidth: columnWidths.likelihoodPost, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Likelihood (Post)<ColumnResizer columnName="likelihoodPost" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.impactPost, minWidth: columnWidths.impactPost, maxWidth: columnWidths.impactPost, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Impact (Post)<ColumnResizer columnName="impactPost" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.createdAt, minWidth: columnWidths.createdAt, maxWidth: columnWidths.createdAt, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Created At<ColumnResizer columnName="createdAt" /></Box>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.updatedAt, minWidth: columnWidths.updatedAt, maxWidth: columnWidths.updatedAt, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
                    <Box sx={{ position: 'relative' }}>Updated At<ColumnResizer columnName="updatedAt" /></Box>
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
                      backgroundColor: '#f8fafc',
                      zIndex: 3,
                      fontWeight: 600,
                      borderLeft: '1px solid #f1f5f9',
                      padding: '8px',
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
                    <TableCell colSpan={24} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        {searchQuery || riskIdFilter || departmentFilter ? 'No results found' : 'No risks found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const isSelected = selected.includes(row.riskId || row._id || row.id)
                      return (
                      <TableRow key={row.riskId} hover selected={isSelected} sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background-color 0.2s', '&:hover': { backgroundColor: '#f8fafc !important' } }}>
                        <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 2, borderRight: '1px solid #f1f5f9' }}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectRow(row.riskId || row._id || row.id)}
                            sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#3b82f6' } }}
                          />
                        </TableCell>
                        <TableCell
                          title={row.riskId}
                          sx={{
                            width: columnWidths.riskId,
                            minWidth: columnWidths.riskId,
                            maxWidth: columnWidths.riskId,
                            position: 'sticky',
                            left: 50,
                            backgroundColor: 'white',
                            zIndex: 2,
                            fontWeight: 700,
                            color: '#0f172a',
                            borderRight: '1px solid #f1f5f9',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            padding: '12px 16px',
                            fontSize: '13px'
                          }}
                        >
                          <Tooltip title={row.riskId || '-'} placement="top-start">
                            <span>{row.riskId?.slice(-5) || '-'}</span>
                          </Tooltip>
                        </TableCell>

                        <TableCell sx={{ width: columnWidths.department, padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{row.department || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.date, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.date || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.riskType, padding: '12px 16px', fontSize: '13px', color: '#334155' }} align='center'>{row.riskType || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.assetType, padding: '12px 16px', fontSize: '13px', color: '#475569' }} align='center'>{row.assetType || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.asset, padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>{row.asset || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.description, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.riskDescription || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.confidentiality, padding: '12px 16px', fontSize: '13px', color: '#475569' }} align='center'>{row.confidentiality ?? '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.integrity, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.integrity ?? '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.availability, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.availability ?? '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.probability, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.probability ?? '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.existingControls, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.existingControls || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.additionalNotes, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.additionalNotes || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.controlRef, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.controlReference || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.additionalControls, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.additionalControls || '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.days, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.numberOfDays ?? '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.deadline, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.deadlineDate || '-'}</TableCell>

                        <TableCell sx={{ width: columnWidths.status, padding: '12px 16px', fontSize: '13px' }}>
                          {renderStatusChip(row.status)}
                        </TableCell>

                        <TableCell sx={{ width: columnWidths.riskScore, padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{row.riskScore ?? '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.riskLevel, padding: '12px 16px', fontSize: '13px' }}>
                          {renderRiskLevel(row.riskLevel)}
                        </TableCell>
                        <TableCell sx={{ width: columnWidths.likelihoodPost, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.likelihoodAfterTreatment ?? '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.impactPost, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.impactAfterTreatment ?? '-'}</TableCell>
                        <TableCell sx={{ width: columnWidths.createdAt, padding: '12px 16px', fontSize: '13px', color: '#94a3b8' }}>
                          {row.createdAt ? row.createdAt.substring(0, 10) : '-'}
                        </TableCell>
                        <TableCell sx={{ width: columnWidths.updatedAt, padding: '12px 16px', fontSize: '13px', color: '#94a3b8' }}>
                          {row.updatedAt ? row.updatedAt.substring(0, 10) : '-'}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            width: columnWidths.actions,
                            minWidth: columnWidths.actions,
                            maxWidth: columnWidths.actions,
                            position: 'sticky',
                            right: 0,
                            backgroundColor: 'white',
                            zIndex: 1,
                            borderLeft: '1px solid #f1f5f9',
                            padding: '12px 16px'
                          }}
                        >
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton size="small" onClick={() => handleEdit(row.riskId)} sx={{ color: '#64748b', '&:hover': { color: '#3b82f6', backgroundColor: '#eff6ff' } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleOpenDelete(row.riskId)} sx={{ color: '#64748b', '&:hover': { color: '#ef4444', backgroundColor: '#fef2f2' } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )})
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

        <Dialog open={open} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Risk</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              You are about to delete risk <strong>{deleteTarget}</strong>. This action <strong>cannot be undone</strong>.
            </DialogContentText>
            <DialogContentText sx={{ mb: 1 }}>
              Type <strong>confirm</strong> to proceed:
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmText.trim().toLowerCase() === 'confirm' && handleConfirmDelete()}
              error={confirmText.length > 0 && confirmText.trim().toLowerCase() !== 'confirm'}
              helperText={
                confirmText.length > 0 && confirmText.trim().toLowerCase() !== 'confirm'
                  ? 'Please type "confirm" exactly'
                  : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDelete}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              disabled={confirmText.trim().toLowerCase() !== 'confirm'}
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- Batch Delete Dialog --- */}
        <Dialog open={openBatchDelete} onClose={handleCloseBatchDelete} maxWidth="xs" fullWidth>
          <DialogTitle>
            Delete {selected.length} Risk{selected.length > 1 ? 's' : ''}?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Are you sure you want to delete the selected {selected.length} item{selected.length > 1 ? 's' : ''}?
              This action <strong>cannot be undone</strong>.
            </DialogContentText>
            <DialogContentText sx={{ mb: 1 }}>
              Type <strong>confirm</strong> to proceed:
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder='confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmBatchDelete()}
              error={confirmText.length > 0 && confirmText.trim().toLowerCase() !== 'confirm'}
              helperText={
                confirmText.length > 0 && confirmText.trim().toLowerCase() !== 'confirm'
                  ? 'Please type "confirm" exactly'
                  : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBatchDelete} disabled={batchDeleting}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={confirmText.trim().toLowerCase() !== 'confirm' || batchDeleting}
              onClick={handleConfirmBatchDelete}
            >
              {batchDeleting ? 'Deleting...' : `Delete ${selected.length} Risk${selected.length > 1 ? 's' : ''}`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}

export default RisksLists