'use client'

// import React, { useEffect, useState, useMemo } from 'react'
// import { useHistory } from 'react-router-dom'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TablePagination,
//   Paper,
//   IconButton,
//   Box,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Button,
//   Stack,
//   Typography,
//   Tooltip,
//   Skeleton,
//   TextField,
//   InputAdornment,
//   Checkbox
// } from '@mui/material'
// import EditIcon from '@mui/icons-material/Edit'
// import DeleteIcon from '@mui/icons-material/Delete'
// import DownloadIcon from '@mui/icons-material/Download'
// import RotateLeftIcon from '@mui/icons-material/RotateLeft'
// import SearchIcon from '@mui/icons-material/Search'
// import CloseIcon from '@mui/icons-material/Close'
// import FilterListOffIcon from '@mui/icons-material/FilterListOff'
// import axios from '../../api/adminAxios'

// // ── Auth helper for fetch() calls ────────────────────────────────────────
// const getAdminFetchHeaders = (extra = {}) => {
//   const token = sessionStorage.getItem("token");
//   const user = JSON.parse(sessionStorage.getItem("user") || "{}");
//   return {
//     Authorization: token ? `Bearer ${token}` : undefined,
//     "x-org": user.organization || undefined,
//     "x-region": user.region || "US",
//     ...extra,
//   };
// };
// // ─────────────────────────────────────────────────────────────────────────

// const BASE_URL = `${process.env.NEXT_PUBLIC_SP}/risk-service/api/risks`

// const DEFAULT_COLUMN_WIDTHS = {
//   riskId: 150,
//   department: 150,
//   riskType: 150,
//   asset: 150,
//   threat: 150,
//   vulnerability: 180,
//   riskDescription: 250,
//   riskScore: 100,
//   probability: 100,
//   status: 100,
//   createdAt: 120,
//   updatedAt: 120,
//   actions: 100
// }

// const renderStatusChip = (status) => {
//   let bg = '#f1f5f9', color = '#64748b';
//   if (status?.toLowerCase() === 'open') { bg = '#fee2e2'; color = '#ef4444'; }
//   else if (status?.toLowerCase() === 'closed') { bg = '#dcfce7'; color = '#22c55e'; }
//   else if (status?.toLowerCase() === 'in progress') { bg = '#fef3c7'; color = '#f59e0b'; }
  
//   return (
//     <Chip
//       label={status || 'N/A'}
//       size="small"
//       sx={{
//         backgroundColor: bg,
//         color: color,
//         fontWeight: 600,
//         borderRadius: '6px',
//         height: '24px',
//         border: 'none',
//       }}
//     />
//   );
// };

// const renderRiskLevel = (level) => {
//   let bg = 'transparent', color = 'inherit';
//   const lower = level?.toLowerCase();
//   if (lower === 'high' || lower === 'critical') { bg = '#fee2e2'; color = '#ef4444'; }
//   else if (lower === 'medium') { bg = '#fef3c7'; color = '#f59e0b'; }
//   else if (lower === 'low') { bg = '#dcfce7'; color = '#22c55e'; }
  
//   if (bg === 'transparent') return level || '-';
  
//   return (
//     <Box sx={{
//       display: 'inline-flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       px: 1.5,
//       py: 0.5,
//       borderRadius: '6px',
//       backgroundColor: bg,
//       color: color,
//       fontWeight: 700,
//       fontSize: '11px',
//       letterSpacing: '0.04em',
//       textTransform: 'uppercase'
//     }}>
//       {level}
//     </Box>
//   );
// };

// function RisksLists() {
//   const history = useHistory()

//   const [rows, setRows] = useState([])
//   const [page, setPage] = useState(0)
//   const [rowsPerPage, setRowsPerPage] = useState(25)
//   const [loading, setLoading] = useState(true)

//   // Filters
//   const [riskIdFilter, setRiskIdFilter] = useState('')
//   const [departmentFilter, setDepartmentFilter] = useState('')
//   const [riskTypeFilter, setRiskTypeFilter] = useState('')
//   const [assetFilter, setAssetFilter] = useState('')
//   const [assetTypeFilter, setAssetTypeFilter] = useState('')
//   const [threatFilter, setThreatFilter] = useState('')
//   const [startDate, setStartDate] = useState('')
//   const [endDate, setEndDate] = useState('')

//   // Global search
//   const [searchQuery, setSearchQuery] = useState('')

//   // Delete dialog
//   const [open, setOpen] = useState(false)
//   const [deleteTarget, setDeleteTarget] = useState(null)

//   // Batch delete state
//   const [selected, setSelected] = useState([])
//   const [openBatchDelete, setOpenBatchDelete] = useState(false)
//   const [confirmText, setConfirmText] = useState('')
//   const [batchDeleting, setBatchDeleting] = useState(false)

//   // Column widths state
//   const [columnWidths, setColumnWidths] = useState(() => {
//     const saved = localStorage.getItem('riskListColumnWidths')
//     return saved ? JSON.parse(saved) : DEFAULT_COLUMN_WIDTHS
//   })

//   // Resizing state
//   const [resizing, setResizing] = useState(null)
//   const [startX, setStartX] = useState(0)
//   const [startWidth, setStartWidth] = useState(0)
//   const [hoveredResizer, setHoveredResizer] = useState(null)

//   useEffect(() => {
//     fetchRisks()
//   }, [])

//   // Save column widths to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem('riskListColumnWidths', JSON.stringify(columnWidths))
//   }, [columnWidths])

//   const fetchRisks = async () => {
//     setLoading(true);
//     try {
//       // Use the known root credentials
//       const username = "username";
//       const password = "password";
//       const basicToken = btoa(`${username}:${password}`);

//       const response = await fetch(BASE_URL, {
//         method: "GET",
//         headers: {
//           Authorization: `Basic ${basicToken}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch risks: ${response.statusText}`);
//       }

//       const data = await response.json();
//       setRows(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch risks:", err);
//     } finally {
//       setLoading(false);
//     }
//   };
//   // Create unique lists for dropdowns
//   const departments = [...new Set(rows.map(r => r.department).filter(Boolean))]
//   const riskTypes = [...new Set(rows.map(r => r.riskType).filter(Boolean))]
//   const assets = [...new Set(rows.map(r => r.asset).filter(Boolean))]
//   const assetTypes = [...new Set(rows.map(r => r.assetType).filter(Boolean))]
//   const threats = [...new Set(rows.map(r => r.threat).filter(Boolean))]

//   // Combined filters with global search
//   const filteredRows = useMemo(() => {
//     let filtered = rows

//     // Apply column-specific filters
//     filtered = filtered.filter((row) => {
//       const matchesId = row.riskId?.toLowerCase().includes(riskIdFilter.toLowerCase())
//       const matchesDept = departmentFilter === '' || row.department === departmentFilter
//       const matchesRiskType = riskTypeFilter === '' || row.riskType === riskTypeFilter
//       const matchesAsset = assetFilter === '' || row.asset === assetFilter
//       const matchesThreat = threatFilter === '' || row.threat === threatFilter

//       let matchesDate = true
//       const rowDate = row.createdAt || row.date
//       if (startDate && rowDate) matchesDate = matchesDate && rowDate >= startDate
//       if (endDate && rowDate) matchesDate = matchesDate && rowDate <= endDate

//       return matchesId && matchesDept && matchesRiskType && matchesAsset && matchesThreat && matchesDate
//     })

//     // Apply global search
//     if (searchQuery) {
//       filtered = filtered.filter(row => {
//         const searchLower = searchQuery.toLowerCase()
        
//         return (
//           row.riskId?.toLowerCase().includes(searchLower) ||
//           row.department?.toLowerCase().includes(searchLower) ||
//           row.riskType?.toLowerCase().includes(searchLower) ||
//           row.assetType?.toLowerCase().includes(searchLower) ||
//           row.asset?.toLowerCase().includes(searchLower) ||
//           row.riskDescription?.toLowerCase().includes(searchLower) ||
//           row.existingControls?.toLowerCase().includes(searchLower) ||
//           row.status?.toLowerCase().includes(searchLower)
//         )
//       })
//     }

//     return filtered
//   }, [rows, riskIdFilter, departmentFilter, riskTypeFilter, assetFilter, threatFilter, startDate, endDate, searchQuery])

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage)
//   }

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10))
//     setPage(0)
//   }

//   const clearFilters = () => {
//     setRiskIdFilter('')
//     setDepartmentFilter('')
//     setRiskTypeFilter('')
//     setAssetFilter('')
//     setAssetTypeFilter('')
//     setThreatFilter('')
//     setStartDate('')
//     setEndDate('')
//     setSearchQuery('')
//     setPage(0)
//   }

//   const exportToCSV = () => {
//     const headers = [
//       'Risk ID', 'Department', 'Risk Type', 'Asset', 'Threat', 'Vulnerability',
//       'Risk Description', 'Risk Score', 'Probability', 'Status', 'Created At', 'Updated At'
//     ]

//     const csvRows = filteredRows.map(row => {
//       const values = [
//         row.riskId,
//         row.department,
//         row.riskType,
//         row.asset,
//         row.threat,
//         Array.isArray(row.vulnerability) ? row.vulnerability.join('; ') : row.vulnerability,
//         row.riskDescription,
//         row.riskScore,
//         row.probability,
//         row.status,
//         row.createdAt,
//         row.updatedAt
//       ]

//       const formattedValues = values.map(val => {
//         const str = String(val ?? '')
//         if (str.includes(',') || str.includes('\n') || str.includes('"')) {
//           return `"${str.replace(/"/g, '""')}"`
//         }
//         return str
//       })

//       return formattedValues.join(',')
//     })
    
//     const csvContent = [headers.join(','), ...csvRows].join('\n')
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
//     const link = document.createElement('a')
//     link.href = URL.createObjectURL(blob)
//     link.setAttribute('download', `risk_report_${new Date().toISOString().slice(0,10)}.csv`)
//     link.click()
//   }

//   const handleEdit = (id) => {
//     history.push(`/risks/risk_sample/edit/${id}`)
//   }

//   const handleOpenDelete = (id) => {
//     setDeleteTarget(id)
//     setConfirmText('')
//     setOpen(true)
//   }

//   const handleCloseDelete = () => {
//     setOpen(false)
//     setConfirmText('')
//   }

//   const handleConfirmDelete = async () => {
//     try {
//       await axios.delete(`${BASE_URL}/${deleteTarget}`)
//       setOpen(false)
//       setConfirmText('')
//       setSelected(prev => prev.filter(id => id !== deleteTarget))
//       fetchRisks()
//     } catch (err) {
//       console.error(err)
//       alert('Delete failed')
//       setConfirmText('')
//     }
//   }

//   // --- Batch Delete Handlers ---
//   const visibleIds = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(r => r._id || r.id || r.riskId)
//   const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id))
//   const isIndeterminate = visibleIds.some(id => selected.includes(id)) && !isAllVisibleSelected

//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       setSelected(prev => Array.from(new Set([...prev, ...visibleIds])))
//     } else {
//       setSelected(prev => prev.filter(id => !visibleIds.includes(id)))
//     }
//   }

//   const handleSelectRow = (id) => {
//     setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id])
//   }

//   const handleOpenBatchDelete = () => {
//     setConfirmText('')
//     setOpenBatchDelete(true)
//   }

//   const handleCloseBatchDelete = () => {
//     setOpenBatchDelete(false)
//     setConfirmText('')
//   }

//   const handleConfirmBatchDelete = async () => {
//     if (confirmText.trim().toLowerCase() !== 'confirm') return
//     setBatchDeleting(true)
//     try {
//       // Typically there should be a bulk delete endpoint, 
//       // but without one defined in the API, we use Promise.all over individual deletes
//       await Promise.all(selected.map(id => axios.delete(`${BASE_URL}/${id}`)))
//       setSelected([])
//       setOpenBatchDelete(false)
//       setConfirmText('')
//       fetchRisks()
//     } catch (err) {
//       console.error(err)
//       alert("Batch delete failed")
//     } finally {
//       setBatchDeleting(false)
//     }
//   }

//   // Column resizing handlers
//   const handleMouseDown = (columnName, e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setResizing(columnName)
//     setStartX(e.clientX)
//     setStartWidth(columnWidths[columnName])
//   }

//   const handleMouseMove = (e) => {
//     if (!resizing) return

//     const diff = e.clientX - startX
//     const newWidth = Math.max(60, startWidth + diff)

//     setColumnWidths(prev => ({
//       ...prev,
//       [resizing]: newWidth
//     }))
//   }

//   const handleMouseUp = () => {
//     setResizing(null)
//   }

//   useEffect(() => {
//     if (resizing) {
//       document.addEventListener('mousemove', handleMouseMove)
//       document.addEventListener('mouseup', handleMouseUp)

//       return () => {
//         document.removeEventListener('mousemove', handleMouseMove)
//         document.removeEventListener('mouseup', handleMouseUp)
//       }
//     }
//   }, [resizing, startX, startWidth])

//   // Reset column widths
//   const resetColumnWidths = () => {
//     setColumnWidths(DEFAULT_COLUMN_WIDTHS)
//     localStorage.removeItem('riskListColumnWidths')
//   }

//   // Resizer component
//   const ColumnResizer = ({ columnName }) => (
//     <Box
//       sx={{
//         width: '16px',
//         height: '100%',
//         position: 'absolute',
//         right: '-8px',
//         top: 0,
//         cursor: 'col-resize',
//         zIndex: 10,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         userSelect: 'none'
//       }}
//       onMouseDown={(e) => handleMouseDown(columnName, e)}
//       onMouseEnter={() => setHoveredResizer(columnName)}
//       onMouseLeave={() => setHoveredResizer(null)}
//     >
//       <Box
//         sx={{
//           width: '2px',
//           height: hoveredResizer === columnName || resizing === columnName ? '70%' : '50%',
//           backgroundColor: hoveredResizer === columnName || resizing === columnName 
//             ? '#94a3b8' 
//             : '#d1d5db',
//           borderRadius: '1px',
//           transition: 'all 0.15s ease',
//           pointerEvents: 'none'
//         }}
//       />
//     </Box>
//   )

//   // Skeleton Loading Component
//   const SkeletonRows = () => (
//     <>
//       {[...Array(10)].map((_, index) => (
//         <TableRow key={index}>
//           <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1 }}>
//             <Skeleton variant="text" width="80%" height={24} />
//           </TableCell>
//           {Object.keys(DEFAULT_COLUMN_WIDTHS).slice(1, -1).map((key, idx) => (
//             <TableCell key={idx}>
//               <Skeleton variant="text" width="85%" height={24} />
//             </TableCell>
//           ))}
//           <TableCell align="center" sx={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1 }}>
//             <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
//               <Skeleton variant="circular" width={32} height={32} />
//               <Skeleton variant="circular" width={32} height={32} />
//             </Box>
//           </TableCell>
//         </TableRow>
//       ))}
//     </>
//   )

//   return (
//     <Box sx={{ backgroundColor: '#ffffff', minHeight: '100%', pt: 1, pb: 4 }}>
//       <Typography variant="h5" sx={{ px: 3, py: 2, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
//         Root Risk Assessment Register
//       </Typography>

//       {/* Search Bar and Action Buttons */}
//       <Box sx={{ px: 3, pb: 2 }}>
//         <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
//           {/* Global Search */}
//           <Box sx={{ flex: 1, width: '100%' }}>
//             <TextField
//               size="small"
//               placeholder="Search across all columns..."
//               value={searchQuery}
//               onChange={(e) => {
//                 setSearchQuery(e.target.value)
//                 setPage(0)
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
//                   </InputAdornment>
//                 ),
//                 endAdornment: searchQuery && (
//                   <InputAdornment position="end">
//                     <IconButton
//                       size="small"
//                       onClick={() => setSearchQuery('')}
//                       edge="end"
//                     >
//                       <CloseIcon fontSize="small" />
//                     </IconButton>
//                   </InputAdornment>
//                 )
//               }}
//               sx={{
//                 width: '100%',
//                 maxWidth: 480,
//                 backgroundColor: '#ffffff',
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: '12px',
//                   boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//                   '& fieldset': { borderColor: '#e2e8f0' },
//                   '&:hover fieldset': { borderColor: '#cbd5e1' },
//                   '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
//                 }
//               }}
//             />
//             {searchQuery && (
//               <Typography variant="caption" sx={{ ml: 2, color: '#64748b', display: 'inline-block', mt: 0.5, fontWeight: 500 }}>
//                 Showing {filteredRows.length} of {rows.length} results
//               </Typography>
//             )}
//           </Box>

//           {/* Header Actions */}
//           <Stack direction="row" spacing={1.5} alignItems="center">
//             {selected.length > 0 && (
//               <Button
//                 variant="contained"
//                 color="error"
//                 startIcon={<DeleteIcon />}
//                 onClick={handleOpenBatchDelete}
//                 sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(239,68,68,0.2)' } }}
//               >
//                 Delete ({selected.length})
//               </Button>
//             )}
//             <Tooltip title='Reset Column Widths' placement='top'>
//               <Button
//                 variant="outlined"
//                 size="small"
//                 onClick={resetColumnWidths}
//                 sx={{ minWidth: 0, width: 38, height: 38, borderRadius: '8px', borderColor: '#e2e8f0', color: '#64748b' }}
//               >
//                 <RotateLeftIcon fontSize="small" /> 
//               </Button>
//             </Tooltip>
//             <Button 
//               variant="outlined" 
//               size="small"
//               startIcon={<FilterListOffIcon />} 
//               onClick={clearFilters}
//               sx={{ height: 38, borderRadius: '8px', textTransform: 'none', fontWeight: 500, borderColor: '#e2e8f0', color: '#475569', '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' } }}
//             >
//               Clear Filters
//             </Button>
//             <Button 
//               variant="contained" 
//               size="small"
//               startIcon={<DownloadIcon />}
//               onClick={exportToCSV}
//               disabled={loading}
//               sx={{ height: 38, borderRadius: '8px', textTransform: 'none', fontWeight: 600, backgroundColor: '#3b82f6', boxShadow: 'none', '&:hover': { backgroundColor: '#2563eb', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' } }}
//             >
//               Export CSV
//             </Button>
//           </Stack>
//         </Stack>
//       </Box>

//       {/* Date Range Filters */}
//       <Box sx={{ px: 3, pb: 3 }}>
//         <Stack direction="row" spacing={2} alignItems="flex-end">
//           <Box>
//             <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', mb: 0.5 }}>
//               From Date
//             </Typography>
//             <TextField
//               type="date"
//               size="small"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } } }}
//             />
//           </Box>
//           <Box>
//             <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', mb: 0.5 }}>
//               To Date
//             </Typography>
//             <TextField
//               type="date"
//               size="small"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } } }}
//             />
//           </Box>
//         </Stack>
//       </Box>
      
//       <Box sx={{ px: 3, pb: 2 }}>
//         <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
//           <TableContainer sx={{ maxHeight: '70vh', overflowX: 'auto' }}>
//             <Table stickyHeader size="small">
//               <TableHead>
//                 <TableRow>
//                   {/* Checkbox Column */}
//                   <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, backgroundColor: '#f8fafc', borderRight: '1px solid #f1f5f9', zIndex: 4, width: '50px' }}>
//                     <Checkbox
//                       indeterminate={isIndeterminate}
//                       checked={isAllVisibleSelected}
//                       onChange={handleSelectAll}
//                     />
//                   </TableCell>

//                   {/* Risk ID Column */}
//                   <TableCell
//                     sx={{
//                       width: columnWidths.riskId,
//                       minWidth: columnWidths.riskId,
//                       maxWidth: columnWidths.riskId,
//                       position: 'sticky',
//                       left: 50,
//                       backgroundColor: '#f8fafc',
//                       zIndex: 3,
//                       fontWeight: 600,
//                       borderRight: '1px solid #f1f5f9',
//                       userSelect: 'none',
//                       padding: '8px',
//                       fontSize: '13px'
//                     }}
//                   >
//                     <Box sx={{ position: 'relative' }}>
//                       <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Risk ID</Typography>
//                       <TextField
//                         size="small"
//                         placeholder="Search ID..."
//                         value={riskIdFilter}
//                         onChange={(e) => {
//                           setRiskIdFilter(e.target.value)
//                           setPage(0)
//                         }}
//                         sx={{
//                           '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
//                         }}
//                       />
//                       <ColumnResizer columnName="riskId" />
//                     </Box>
//                   </TableCell>

//                   {/* Department Column */}
//                   <TableCell 
//                     sx={{ 
//                       backgroundColor: '#f8fafc',
//                       width: columnWidths.department,
//                       minWidth: columnWidths.department,
//                       maxWidth: columnWidths.department,
//                       fontWeight: 600,
//                       position: 'relative',
//                       userSelect: 'none',
//                       padding: '8px',
//                       fontSize: '13px'
//                     }}
//                   >
//                     <Box sx={{ position: 'relative' }}>
//                       <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Department</Typography>
//                       <TextField
//                         select
//                         size="small"
//                         value={departmentFilter}
//                         onChange={(e) => setDepartmentFilter(e.target.value)}
//                         SelectProps={{ native: true }}
//                         sx={{
//                           '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
//                         }}
//                       >
//                         <option value="">All</option>
//                         {departments.map((dept) => (
//                           <option key={dept} value={dept}>{dept}</option>
//                         ))}
//                       </TextField>
//                       <ColumnResizer columnName="department" />
//                     </Box>
//                   </TableCell>



//                   {/* Risk Type Column */}
//                   <TableCell 
//                     sx={{ 
//                       backgroundColor: '#f8fafc',
//                       width: columnWidths.riskType,
//                       minWidth: columnWidths.riskType,
//                       maxWidth: columnWidths.riskType,
//                       fontWeight: 600,
//                       position: 'relative',
//                       userSelect: 'none',
//                       padding: '8px',
//                       fontSize: '13px'
//                     }}
//                   >
//                     <Box sx={{ position: 'relative' }}>
//                       <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Risk Type</Typography>
//                       <TextField
//                         select
//                         size="small"
//                         value={riskTypeFilter}
//                         onChange={(e) => setRiskTypeFilter(e.target.value)}
//                         SelectProps={{ native: true }}
//                         sx={{
//                           '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
//                         }}
//                       >
//                         <option value="">All</option>
//                         {riskTypes.map((type) => (
//                           <option key={type} value={type}>{type}</option>
//                         ))}
//                       </TextField>
//                       <ColumnResizer columnName="riskType" />
//                     </Box>
//                   </TableCell>

//                   {/* Asset Type Column */}
//                   <TableCell 
//                     sx={{ 
//                       backgroundColor: '#f8fafc',
//                       width: columnWidths.assetType,
//                       minWidth: columnWidths.assetType,
//                       maxWidth: columnWidths.assetType,
//                       fontWeight: 600,
//                       position: 'relative',
//                       userSelect: 'none',
//                       padding: '8px',
//                       fontSize: '13px'
//                     }}
//                   >
//                     <Box sx={{ position: 'relative' }}>
//                       <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Asset Type</Typography>
//                       <TextField
//                         select
//                         size="small"
//                         value={assetTypeFilter}
//                         onChange={(e) => setAssetTypeFilter(e.target.value)}
//                         SelectProps={{ native: true }}
//                         sx={{
//                           '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
//                         }}
//                       >
//                         <option value="">All</option>
//                         {assetTypes.map((type) => (
//                           <option key={type} value={type}>{type}</option>
//                         ))}
//                       </TextField>
//                       <ColumnResizer columnName="assetType" />
//                     </Box>
//                   </TableCell>

//                   {/* Asset Column */}
//                   <TableCell 
//                     sx={{ 
//                       backgroundColor: '#f8fafc',
//                       width: columnWidths.asset,
//                       minWidth: columnWidths.asset,
//                       maxWidth: columnWidths.asset,
//                       fontWeight: 600,
//                       position: 'relative',
//                       userSelect: 'none',
//                       padding: '8px',
//                       fontSize: '13px'
//                     }}
//                   >
//                     <Box sx={{ position: 'relative' }}>
//                       <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Asset</Typography>
//                       <TextField
//                         select
//                         size="small"
//                         value={assetFilter}
//                         onChange={(e) => setAssetFilter(e.target.value)}
//                         SelectProps={{ native: true }}
//                         sx={{
//                           '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
//                         }}
//                       >
//                         <option value="">All</option>
//                         {assets.map((asset) => (
//                           <option key={asset} value={asset}>{asset}</option>
//                         ))}
//                       </TextField>
//                       <ColumnResizer columnName="asset" />
//                     </Box>
//                   </TableCell>

//                   {/* Threat Column */}
//                   <TableCell 
//                     sx={{ 
//                       backgroundColor: '#f8fafc',
//                       width: columnWidths.threat,
//                       minWidth: columnWidths.threat,
//                       maxWidth: columnWidths.threat,
//                       fontWeight: 600,
//                       position: 'relative',
//                       userSelect: 'none',
//                       padding: '8px',
//                       fontSize: '13px'
//                     }}
//                   >
//                     <Box sx={{ position: 'relative' }}>
//                       <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Threat</Typography>
//                       <TextField
//                         select
//                         size="small"
//                         value={threatFilter}
//                         onChange={(e) => setThreatFilter(e.target.value)}
//                         SelectProps={{ native: true }}
//                         sx={{
//                           '& .MuiInputBase-input': { fontSize: '12px', padding: '4px 8px' }
//                         }}
//                       >
//                         <option value="">All</option>
//                         {threats.map((t) => (
//                           <option key={t} value={t}>{t}</option>
//                         ))}
//                       </TextField>
//                       <ColumnResizer columnName="threat" />
//                     </Box>
//                   </TableCell>

//                   {/* Vulnerability Column */}
//                   <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.vulnerability, minWidth: columnWidths.vulnerability, maxWidth: columnWidths.vulnerability, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
//                     <Box sx={{ position: 'relative' }}>Vulnerability<ColumnResizer columnName="vulnerability" /></Box>
//                   </TableCell>

//                   {/* Risk Description Column */}
//                   <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.riskDescription, minWidth: columnWidths.riskDescription, maxWidth: columnWidths.riskDescription, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
//                     <Box sx={{ position: 'relative' }}>Risk Description<ColumnResizer columnName="riskDescription" /></Box>
//                   </TableCell>

//                   {/* Risk Score Column */}
//                   <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.riskScore, minWidth: columnWidths.riskScore, maxWidth: columnWidths.riskScore, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
//                     <Box sx={{ position: 'relative' }}>Risk Score<ColumnResizer columnName="riskScore" /></Box>
//                   </TableCell>

//                   {/* Probability Column */}
//                   <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.probability, minWidth: columnWidths.probability, maxWidth: columnWidths.probability, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
//                     <Box sx={{ position: 'relative' }}>Probability<ColumnResizer columnName="probability" /></Box>
//                   </TableCell>

//                   {/* Status Column */}
//                   <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
//                     <Box sx={{ position: 'relative' }}>Status<ColumnResizer columnName="status" /></Box>
//                   </TableCell>

//                   {/* Created At Column */}
//                   <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.createdAt, minWidth: columnWidths.createdAt, maxWidth: columnWidths.createdAt, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
//                     <Box sx={{ position: 'relative' }}>Created At<ColumnResizer columnName="createdAt" /></Box>
//                   </TableCell>

//                   {/* Updated At Column */}
//                   <TableCell sx={{ backgroundColor: '#f8fafc', width: columnWidths.updatedAt, minWidth: columnWidths.updatedAt, maxWidth: columnWidths.updatedAt, fontWeight: 600, position: 'relative', padding: '8px', fontSize: '13px' }}>
//                     <Box sx={{ position: 'relative' }}>Updated At<ColumnResizer columnName="updatedAt" /></Box>
//                   </TableCell>

//                   {/* Actions Column */}
//                   <TableCell
//                     align="center"
//                     sx={{
//                       width: columnWidths.actions,
//                       minWidth: columnWidths.actions,
//                       maxWidth: columnWidths.actions,
//                       position: 'sticky',
//                       right: 0,
//                       backgroundColor: '#f8fafc',
//                       zIndex: 3,
//                       fontWeight: 600,
//                       borderLeft: '1px solid #f1f5f9',
//                       padding: '8px',
//                       fontSize: '13px'
//                     }}
//                   >
//                     Actions
//                   </TableCell>
//                 </TableRow>
//               </TableHead>

//               <TableBody>
//                 {loading ? (
//                   <SkeletonRows />
//                 ) : filteredRows.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={24} align="center" sx={{ py: 4 }}>
//                       <Typography variant="body1" color="textSecondary">
//                         {searchQuery || riskIdFilter || departmentFilter ? 'No results found' : 'No risks found'}
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredRows
//                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                     .map((row) => {
//                       const isSelected = selected.includes(row.riskId || row._id || row.id)
//                       return (
//                       <TableRow key={row.riskId} hover selected={isSelected} sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background-color 0.2s', '&:hover': { backgroundColor: '#f8fafc !important' } }}>
//                         <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 2, borderRight: '1px solid #f1f5f9' }}>
//                           <Checkbox
//                             checked={isSelected}
//                             onChange={() => handleSelectRow(row.riskId || row._id || row.id)}
//                             sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#3b82f6' } }}
//                           />
//                         </TableCell>
//                         <TableCell
//                           title={row.riskId}
//                           sx={{
//                             width: columnWidths.riskId,
//                             minWidth: columnWidths.riskId,
//                             maxWidth: columnWidths.riskId,
//                             position: 'sticky',
//                             left: 50,
//                             backgroundColor: 'white',
//                             zIndex: 2,
//                             fontWeight: 700,
//                             color: '#0f172a',
//                             borderRight: '1px solid #f1f5f9',
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             whiteSpace: 'nowrap',
//                             padding: '12px 16px',
//                             fontSize: '13px'
//                           }}
//                         >
//                           <Tooltip title={row.riskId || '-'} placement="top-start">
//                             <span>{row.riskId?.slice(-5) || '-'}</span>
//                           </Tooltip>
//                         </TableCell>

//                         <TableCell sx={{ width: columnWidths.department, padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{row.department || '-'}</TableCell>
//                         <TableCell sx={{ width: columnWidths.riskType, padding: '12px 16px', fontSize: '13px', color: '#334155' }} align='center'>{row.riskType || '-'}</TableCell>
//                         <TableCell sx={{ width: columnWidths.assetType ?? 150, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.assetType || '-'}</TableCell>
//                         <TableCell sx={{ width: columnWidths.asset, padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>{row.asset || '-'}</TableCell>
//                         <TableCell sx={{ width: columnWidths.threat, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.threat || '-'}</TableCell>
//                         <TableCell sx={{ width: columnWidths.vulnerability, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
//                           {Array.isArray(row.vulnerability) ? row.vulnerability.join(', ') : (row.vulnerability || '-')}
//                         </TableCell>
//                         <TableCell sx={{ width: columnWidths.riskDescription, padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{row.riskDescription || '-'}</TableCell>
//                         <TableCell sx={{ width: columnWidths.riskScore, padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }} align='center'>{row.riskScore ?? '-'}</TableCell>
//                         <TableCell sx={{ width: columnWidths.probability, padding: '12px 16px', fontSize: '13px', color: '#475569' }} align='center'>{row.probability || '-'}</TableCell>

//                         <TableCell sx={{ width: columnWidths.status, padding: '12px 16px', fontSize: '13px' }}>
//                           {renderStatusChip(row.status)}
//                         </TableCell>

//                         <TableCell sx={{ width: columnWidths.createdAt, padding: '12px 16px', fontSize: '13px', color: '#94a3b8' }}>
//                           {row.createdAt ? row.createdAt.substring(0, 10) : '-'}
//                         </TableCell>
//                         <TableCell sx={{ width: columnWidths.updatedAt, padding: '12px 16px', fontSize: '13px', color: '#94a3b8' }}>
//                           {row.updatedAt ? row.updatedAt.substring(0, 10) : '-'}
//                         </TableCell>

//                         <TableCell
//                           align="center"
//                           sx={{
//                             width: columnWidths.actions,
//                             minWidth: columnWidths.actions,
//                             maxWidth: columnWidths.actions,
//                             position: 'sticky',
//                             right: 0,
//                             backgroundColor: 'white',
//                             zIndex: 1,
//                             borderLeft: '1px solid #f1f5f9',
//                             padding: '12px 16px'
//                           }}
//                         >
//                           <Stack direction="row" spacing={0.5} justifyContent="center">
//                             <IconButton size="small" onClick={() => handleEdit(row.riskId)} sx={{ color: '#64748b', '&:hover': { color: '#3b82f6', backgroundColor: '#eff6ff' } }}>
//                               <EditIcon fontSize="small" />
//                             </IconButton>
//                             <IconButton size="small" onClick={() => handleOpenDelete(row.riskId)} sx={{ color: '#64748b', '&:hover': { color: '#ef4444', backgroundColor: '#fef2f2' } }}>
//                               <DeleteIcon fontSize="small" />
//                             </IconButton>
//                           </Stack>
//                         </TableCell>
//                       </TableRow>
//                     )})
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <TablePagination
//             component="div"
//             count={filteredRows.length}
//             page={page}
//             rowsPerPage={rowsPerPage}
//             rowsPerPageOptions={[25, 100, 500, 1000]}
//             onPageChange={handleChangePage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//           />
//         </Paper>

//         <Dialog open={open} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
//           <DialogTitle>Delete Risk</DialogTitle>
//           <DialogContent>
//             <DialogContentText sx={{ mb: 2 }}>
//               You are about to delete risk <strong>{deleteTarget}</strong>. This action <strong>cannot be undone</strong>.
//             </DialogContentText>
//             <DialogContentText sx={{ mb: 1 }}>
//               Type <strong>confirm</strong> to proceed:
//             </DialogContentText>
//             <TextField
//               autoFocus
//               fullWidth
//               size="small"
//               placeholder="confirm"
//               value={confirmText}
//               onChange={(e) => setConfirmText(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && confirmText.trim().toLowerCase() === 'confirm' && handleConfirmDelete()}
//               error={confirmText.length > 0 && confirmText.trim().toLowerCase() !== 'confirm'}
//               helperText={
//                 confirmText.length > 0 && confirmText.trim().toLowerCase() !== 'confirm'
//                   ? 'Please type "confirm" exactly'
//                   : ''
//               }
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseDelete}>Cancel</Button>
//             <Button
//               color="error"
//               variant="contained"
//               disabled={confirmText.trim().toLowerCase() !== 'confirm'}
//               onClick={handleConfirmDelete}
//             >
//               Delete
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* --- Batch Delete Dialog --- */}
//         <Dialog open={openBatchDelete} onClose={handleCloseBatchDelete} maxWidth="xs" fullWidth>
//           <DialogTitle>
//             Delete {selected.length} Risk{selected.length > 1 ? 's' : ''}?
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText sx={{ mb: 2 }}>
//               Are you sure you want to delete the selected {selected.length} item{selected.length > 1 ? 's' : ''}?
//               This action <strong>cannot be undone</strong>.
//             </DialogContentText>
//             <DialogContentText sx={{ mb: 1 }}>
//               Type <strong>confirm</strong> to proceed:
//             </DialogContentText>
//             <TextField
//               autoFocus
//               fullWidth
//               size="small"
//               placeholder='confirm'
//               value={confirmText}
//               onChange={(e) => setConfirmText(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleConfirmBatchDelete()}
//               error={confirmText.length > 0 && confirmText.trim().toLowerCase() !== 'confirm'}
//               helperText={
//                 confirmText.length > 0 && confirmText.trim().toLowerCase() !== 'confirm'
//                   ? 'Please type "confirm" exactly'
//                   : ''
//               }
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseBatchDelete} disabled={batchDeleting}>
//               Cancel
//             </Button>
//             <Button
//               color="error"
//               variant="contained"
//               disabled={confirmText.trim().toLowerCase() !== 'confirm' || batchDeleting}
//               onClick={handleConfirmBatchDelete}
//             >
//               {batchDeleting ? 'Deleting...' : `Delete ${selected.length} Risk${selected.length > 1 ? 's' : ''}`}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </Box>
//   )
// }

// export default RisksLists

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: '#F0F3F8',
  surface: '#ffffff',
  headerBg: '#1E2A3B',
  headerBorder: '#2E3D52',
  headerText: '#E8ECF2',
  headerMuted: '#8FA5BE',
  filterBg: '#28384F',
  filterBorder: '#3D5068',
  primary: '#2B5CE6',
  primaryHover: '#1D47C4',
  primaryLight: '#EEF3FF',
  danger: '#DC2626',
  dangerHover: '#B91C1C',
  dangerLight: '#FEF2F2',
  border: '#E5E9F0',
  borderLight: '#F1F5F9',
  text: '#111827',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  rowHover: '#F0F5FF',
  rowSelected: '#EEF3FF',
  rowAlt: '#FAFBFC',
  fontMono: `'JetBrains Mono', 'Fira Code', monospace`,
  fontSans: `'DM Sans', system-ui, sans-serif`,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusConfig = {
  open:        { bg: '#FEE2E2', color: '#B91C1C' },
  'in progress': { bg: '#FEF3C7', color: '#92400E' },
  closed:      { bg: '#D1FAE5', color: '#065F46' },
  deferred:    { bg: '#EDE9FE', color: '#5B21B6' },
}
const levelConfig = {
  high:     { bg: '#FEE2E2', color: '#B91C1C' },
  critical: { bg: '#FEE2E2', color: '#B91C1C' },
  medium:   { bg: '#FEF3C7', color: '#92400E' },
  low:      { bg: '#D1FAE5', color: '#065F46' },
}
const scoreColor = (s) => s >= 10 ? '#DC2626' : s >= 5 ? '#D97706' : '#16A34A'

const Chip = ({ label, config }) => {
  if (!label) return <span style={{ color: T.textFaint }}>—</span>
  const cfg = config[label.toLowerCase()] || { bg: '#F1F5F9', color: T.textMuted }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 9px',
      borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '.3px',
      background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const injectGlobalStyles = () => {
  if (document.getElementById('rl-styles')) return
  const s = document.createElement('style')
  s.id = 'rl-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
    @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css');

    .rl-root *, .rl-root *::before, .rl-root *::after { box-sizing: border-box; }
    .rl-root { font-family: ${T.fontSans}; color: ${T.text}; background: ${T.bg}; }

    .rl-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:9px;
      font-size:12px; font-weight:600; cursor:pointer; font-family:${T.fontSans}; border:1px solid transparent;
      transition:all .15s; white-space:nowrap; line-height:1; }
    .rl-btn-outline { background:${T.surface}; border-color:${T.border}; color:${T.textMuted}; }
    .rl-btn-outline:hover { border-color:#C4D5FB; color:${T.primary}; background:${T.primaryLight}; }
    .rl-btn-primary { background:${T.primary}; color:#fff; border-color:${T.primary}; }
    .rl-btn-primary:hover { background:${T.primaryHover}; }
    .rl-btn-danger { background:${T.danger}; color:#fff; border-color:${T.danger}; }
    .rl-btn-danger:hover { background:${T.dangerHover}; }
    .rl-btn:disabled { opacity:.4; cursor:not-allowed; }

    .rl-search { width:100%; padding:7px 32px 7px 32px; border:1px solid ${T.border}; border-radius:9px;
      font-size:13px; font-family:${T.fontSans}; color:${T.text}; background:#F8FAFC; outline:none;
      transition:border-color .15s, box-shadow .15s; }
    .rl-search:focus { border-color:${T.primary}; box-shadow:0 0 0 3px rgba(43,92,230,.1); background:#fff; }
    .rl-search::placeholder { color:#CBD5E0; }

    .rl-date-inp { padding:7px 10px; border:1px solid ${T.border}; border-radius:8px;
      font-size:12px; font-family:${T.fontSans}; color:${T.text}; background:#F8FAFC; outline:none; }

    .rl-tbl-wrap { margin:14px 20px 0; border-radius:14px; border:1px solid ${T.border}; overflow:hidden; background:#fff; }
    .rl-tbl-scroll { overflow-x:auto; max-height:calc(100vh - 280px); overflow-y:auto; }
    .rl-tbl-scroll::-webkit-scrollbar { width:6px; height:6px; }
    .rl-tbl-scroll::-webkit-scrollbar-track { background:#f1f5f9; }
    .rl-tbl-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
    .rl-tbl-scroll::-webkit-scrollbar-thumb:hover { background:#94a3b8; }

    table.rl-table { width:100%; border-collapse:separate; border-spacing:0; min-width:1200px; }

    /* Sticky header */
    table.rl-table thead th { position:sticky; top:0; z-index:3; background:${T.headerBg};
      padding:0; border-bottom:2px solid ${T.headerBorder}; }
    .th-chk { position:sticky; top:0; left:0; z-index:5 !important; background:${T.headerBg} !important;
      border-right:1px solid ${T.headerBorder}; border-bottom:2px solid ${T.headerBorder}; width:44px; padding:0 11px; }
    .th-id-col { position:sticky; top:0; left:44px; z-index:5 !important; background:${T.headerBg} !important;
      border-right:1px solid ${T.headerBorder}; min-width:130px; }
    .th-act { position:sticky; top:0; right:0; z-index:4 !important; background:${T.headerBg} !important;
      border-left:1px solid ${T.headerBorder}; border-bottom:2px solid ${T.headerBorder}; min-width:80px; text-align:center; }

    .th-inner { padding:9px 11px 7px; display:flex; flex-direction:column; gap:5px; min-width:0; }
    .th-lbl { font-size:10px; font-weight:700; color:${T.headerText}; letter-spacing:.7px;
      text-transform:uppercase; white-space:nowrap; display:flex; align-items:center; gap:4px; }
    .th-lbl i { font-size:12px; opacity:.6; }
    .th-filter { width:100%; padding:4px 8px; border:1px solid ${T.filterBorder}; border-radius:6px;
      font-size:11px; font-family:${T.fontSans}; color:${T.headerText}; background:${T.filterBg}; outline:none; }
    .th-filter:focus { border-color:#5B8FD6; }
    .th-filter option { background:${T.headerBg}; color:${T.headerText}; }

    /* Body rows */
    table.rl-table tbody tr { transition:background .1s; }
    table.rl-table tbody tr:nth-child(even) { background:${T.rowAlt}; }
    table.rl-table tbody tr:hover { background:${T.rowHover} !important; }
    table.rl-table tbody tr.rl-sel { background:${T.rowSelected} !important; }

    table.rl-table td { padding:8px 11px; font-size:12px; color:${T.text}; vertical-align:middle;
      white-space:nowrap; border-bottom:1px solid ${T.borderLight}; }
    .td-chk { position:sticky; left:0; z-index:2; background:inherit; border-right:1px solid ${T.borderLight}; width:44px; text-align:center; }
    .td-id  { position:sticky; left:44px; z-index:2; background:inherit;
      font-family:${T.fontMono}; font-size:11px; color:${T.primary}; font-weight:500;
      border-right:1px solid #EEF2F8; }
    .td-act { position:sticky; right:0; z-index:2; background:inherit; border-left:1px solid ${T.borderLight}; }

    input[type=checkbox] { width:15px; height:15px; accent-color:${T.primary}; cursor:pointer; }

    .abtn { display:inline-flex; align-items:center; justify-content:center; width:27px; height:27px;
      border-radius:7px; border:1px solid ${T.border}; background:#fff; cursor:pointer;
      color:${T.textMuted}; transition:all .15s; font-size:14px; }
    .abtn.edit:hover { border-color:${T.primary}; color:${T.primary}; background:${T.primaryLight}; }
    .abtn.del:hover  { border-color:${T.danger}; color:${T.danger}; background:${T.dangerLight}; }

    .rl-badge { background:${T.primaryLight}; color:${T.primary}; font-size:11px; font-weight:700;
      padding:2px 8px; border-radius:20px; }

    .rl-pgbar { padding:10px 16px; display:flex; align-items:center; justify-content:space-between;
      background:#F8FAFC; border-top:1px solid ${T.border}; font-size:12px; flex-wrap:wrap; gap:8px; }
    .rl-pgbtn { padding:5px 10px; border-radius:7px; border:1px solid ${T.border}; background:#fff;
      font-size:12px; font-weight:600; color:${T.textMuted}; cursor:pointer;
      display:flex; align-items:center; gap:3px; transition:all .15s; font-family:${T.fontSans}; }
    .rl-pgbtn:hover:not(:disabled) { border-color:#C4D5FB; color:${T.primary}; background:${T.primaryLight}; }
    .rl-pgbtn:disabled { opacity:.4; cursor:not-allowed; }
    .rl-rpp { padding:4px 8px; border:1px solid ${T.border}; border-radius:7px; font-size:12px;
      font-family:${T.fontSans}; background:#fff; outline:none; }

    /* Dialog overlay */
    .rl-overlay { position:fixed; inset:0; background:rgba(17,24,39,.4); backdrop-filter:blur(2px);
      display:flex; align-items:center; justify-content:center; z-index:9999; }
    .rl-dialog { background:#fff; border-radius:16px; padding:28px; max-width:420px; width:90%;
      box-shadow:0 20px 60px rgba(0,0,0,.15); }
    .rl-dialog-title { font-size:16px; font-weight:700; color:${T.text}; margin-bottom:8px; }
    .rl-dialog-body { font-size:13px; color:${T.textMuted}; line-height:1.6; margin-bottom:16px; }
    .rl-dialog-input { width:100%; padding:8px 12px; border:1px solid ${T.border}; border-radius:9px;
      font-size:13px; font-family:${T.fontSans}; color:${T.text}; outline:none; }
    .rl-dialog-input:focus { border-color:${T.primary}; box-shadow:0 0 0 3px rgba(43,92,230,.1); }
    .rl-dialog-input.error { border-color:${T.danger}; }
    .rl-dialog-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }

    .skel { background:#E8ECF2; border-radius:4px; display:inline-block; height:14px;
      animation:sk 1.4s ease-in-out infinite; }
    @keyframes sk { 0%,100%{opacity:1} 50%{opacity:.4} }

    .rl-empty { text-align:center; padding:52px 16px; }
    .rl-empty-icon { font-size:36px; opacity:.25; display:block; margin-bottom:12px; color:${T.textMuted}; }
    .rl-empty-title { font-size:14px; font-weight:700; color:#374151; margin-bottom:4px; }
    .rl-empty-sub { font-size:12px; color:${T.textFaint}; }
  `
  document.head.appendChild(s)
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const Icon = ({ name, style }) => <i className={`ti ti-${name}`} aria-hidden="true" style={style} />

const SkeletonRow = ({ cols }) => (
  <tr>
    <td className="td-chk"><span className="skel" style={{ width: 15, height: 15, borderRadius: 3 }} /></td>
    <td className="td-id"><span className="skel" style={{ width: 70 }} /></td>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i}><span className="skel" style={{ width: `${55 + (i % 4) * 15}%` }} /></td>
    ))}
    <td className="td-act">
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
        <span className="skel" style={{ width: 27, height: 27, borderRadius: 7 }} />
        <span className="skel" style={{ width: 27, height: 27, borderRadius: 7 }} />
      </div>
    </td>
  </tr>
)

const DeleteDialog = ({ title, body, open, onClose, onConfirm, confirming }) => {
  const [text, setText] = useState('')
  if (!open) return null
  const valid = text.trim().toLowerCase() === 'confirm'
  return (
    <div className="rl-overlay" onClick={onClose}>
      <div className="rl-dialog" onClick={e => e.stopPropagation()}>
        <div className="rl-dialog-title">{title}</div>
        <div className="rl-dialog-body">
          {body}
          <br /><br />
          Type <strong>confirm</strong> to proceed:
        </div>
        <input
          autoFocus
          className={`rl-dialog-input${text.length > 0 && !valid ? ' error' : ''}`}
          placeholder="confirm"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && valid && onConfirm()}
        />
        {text.length > 0 && !valid && (
          <div style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>Type "confirm" exactly</div>
        )}
        <div className="rl-dialog-actions">
          <button className="rl-btn rl-btn-outline" onClick={onClose}>Cancel</button>
          <button className="rl-btn rl-btn-danger" disabled={!valid || confirming} onClick={onConfirm}>
            {confirming ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'department',   label: 'Department',       icon: 'building',   filter: 'dept' },
  { key: 'date',         label: 'Date',              icon: 'calendar',   filter: null   },
  { key: 'riskType',     label: 'Risk Type',         icon: 'tag',        filter: 'riskType' },
  { key: 'assetType',    label: 'Asset Type',        icon: null,         filter: null   },
  { key: 'asset',        label: 'Asset',             icon: null,         filter: null   },
  { key: 'confidentiality', label: 'C',              icon: null,         filter: null, title: 'Confidentiality', center: true },
  { key: 'integrity',    label: 'I',                 icon: null,         filter: null, title: 'Integrity',       center: true },
  { key: 'availability', label: 'A',                 icon: null,         filter: null, title: 'Availability',    center: true },
  { key: 'probability',  label: 'Prob.',             icon: null,         filter: null, center: true },
  { key: 'riskScore',    label: 'Score',             icon: 'chart-bar',  filter: null, center: true },
  { key: 'riskLevel',    label: 'Level',             icon: null,         filter: 'riskLevel' },
  { key: 'status',       label: 'Status',            icon: null,         filter: 'status' },
  { key: 'existingControls', label: 'Existing Controls', icon: null,     filter: null  },
  { key: 'controlReference', label: 'Control Ref.',  icon: null,         filter: null  },
  { key: 'numberOfDays', label: 'Days',              icon: null,         filter: null, center: true },
  { key: 'deadlineDate', label: 'Deadline',          icon: null,         filter: null  },
  { key: 'createdAt',    label: 'Created',           icon: null,         filter: null  },
  { key: 'updatedAt',    label: 'Updated',           icon: null,         filter: null  },
]

// ─── Demo data generator ──────────────────────────────────────────────────────
const DEPTS    = ['Engineering','Finance','HR','Operations','IT']
const RTYPES   = ['Cyber','Operational','Compliance','Financial']
const ATYPES   = ['Software','Hardware','Data','Process']
const ASSETS   = ['Web Server','Database','API Gateway','Firewall','Laptop Fleet']
const CONTROLS = ['MFA Enabled','Firewall Rules','Encryption','Access Control']
const CTREFS   = ['ISO 27001 A.8.1','ISO 27001 A.9.2','ISO 27001 A.12.3','ISO 27001 A.14.1']
const STATUSES = ['Open','In Progress','Closed','Deferred']
const LEVELS   = ['High','Medium','Low']

const DEMO = Array.from({ length: 35 }, (_, i) => {
  const c = (i % 5) + 1, iv = ((i + 1) % 5) + 1, a = ((i + 2) % 5) + 1, p = ((i + 3) % 5) + 1
  const score = Math.round(((c + iv + a) / 3) * p)
  return {
    _id: `id_${i}`,
    riskId: `RSK-${String(100 + i).padStart(4, '0')}`,
    department: DEPTS[i % 5],
    date: `2024-${String((i % 11) + 1).padStart(2, '0')}-${String((i * 3 % 27) + 1).padStart(2, '0')}`,
    riskType: RTYPES[i % 4], assetType: ATYPES[i % 4], asset: ASSETS[i % 5],
    confidentiality: c, integrity: iv, availability: a, probability: p, riskScore: score,
    riskLevel: LEVELS[i % 3], status: STATUSES[i % 4],
    existingControls: CONTROLS[i % 4], controlReference: CTREFS[i % 4],
    numberOfDays: [30, 60, 90, 120][i % 4],
    deadlineDate: `2024-${String((i % 11) + 1).padStart(2, '0')}-28`,
    riskDescription: 'Risk description here for row ' + i,
    createdAt: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
    updatedAt: `2024-03-${String((i % 28) + 1).padStart(2, '0')}`,
  }
})

// ─── Main Component ───────────────────────────────────────────────────────────
const BASE_URL = `${typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SP || ''}/risk-template-service/api/risks`

export default function RisksLists() {
  useEffect(() => { injectGlobalStyles() }, [])

  // Data
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)

  // Pagination
  const [page, setPage]           = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Filters
  const [search, setSearch]             = useState('')
  const [startDate, setStartDate]       = useState('')
  const [endDate, setEndDate]           = useState('')
  const [filters, setFilters]           = useState({ dept: '', riskType: '', riskLevel: '', status: '' })

  // Selection
  const [selected, setSelected] = useState(new Set())

  // Delete dialogs
  const [deleteSingle, setDeleteSingle]     = useState(null)
  const [deleteBatch, setDeleteBatch]       = useState(false)
  const [deleting, setDeleting]             = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchRisks = useCallback(async () => {
    setLoading(true)
    try {
      // In real app: const res = await axios.get(BASE_URL); setRows(res.data)
      await new Promise(r => setTimeout(r, 700)) // simulate network
      setRows(DEMO)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRisks() }, [fetchRisks])

  // ── Dropdown options ──────────────────────────────────────────────────────────
  const opts = useMemo(() => ({
    dept:     [...new Set(rows.map(r => r.department).filter(Boolean))],
    riskType: [...new Set(rows.map(r => r.riskType).filter(Boolean))],
    riskLevel: ['High', 'Medium', 'Low'],
    status:   ['Open', 'In Progress', 'Closed', 'Deferred'],
  }), [rows])

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (filters.dept     && r.department !== filters.dept)     return false
      if (filters.riskType && r.riskType   !== filters.riskType) return false
      if (filters.riskLevel&& r.riskLevel  !== filters.riskLevel)return false
      if (filters.status   && r.status     !== filters.status)   return false
      if (startDate && r.date < startDate) return false
      if (endDate   && r.date > endDate)   return false
      if (search) {
        const q = search.toLowerCase()
        const hay = [r.riskId, r.department, r.riskType, r.asset, r.status, r.riskLevel,
                     r.assetType, r.riskDescription, r.existingControls].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, filters, startDate, endDate, search])

  const pageRows = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))

  // Reset page when filters change
  useEffect(() => { setPage(0) }, [search, filters, startDate, endDate])

  // ── Selection ─────────────────────────────────────────────────────────────────
  const visIds      = pageRows.map(r => r._id || r.riskId)
  const allSel      = visIds.length > 0 && visIds.every(id => selected.has(id))
  const someSel     = visIds.some(id => selected.has(id))
  const indeterminate = someSel && !allSel

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allSel) visIds.forEach(id => next.delete(id))
      else        visIds.forEach(id => next.add(id))
      return next
    })
  }
  const toggleRow = id => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  const confirmDeleteSingle = async () => {
    setDeleting(true)
    try {
      // await axios.delete(`${BASE_URL}/${deleteSingle}`)
      setRows(prev => prev.filter(r => (r._id || r.riskId) !== deleteSingle))
      setSelected(prev => { const n = new Set(prev); n.delete(deleteSingle); return n })
      setDeleteSingle(null)
    } catch (e) { alert('Delete failed') }
    finally { setDeleting(false) }
  }

  const confirmDeleteBatch = async () => {
    setDeleting(true)
    const ids = [...selected]
    try {
      // await Promise.all(ids.map(id => axios.delete(`${BASE_URL}/${id}`)))
      setRows(prev => prev.filter(r => !ids.includes(r._id || r.riskId)))
      setSelected(new Set())
      setDeleteBatch(false)
    } catch (e) { alert('Batch delete failed') }
    finally { setDeleting(false) }
  }

  // ── Export ────────────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Risk ID','Department','Date','Risk Type','Asset Type','Asset','Score','Level','Status','Existing Controls','Control Ref','Days','Deadline']
    const csvRows = filtered.map(r => [
      r.riskId, r.department, r.date, r.riskType, r.assetType, r.asset,
      r.riskScore, r.riskLevel, r.status, r.existingControls, r.controlReference, r.numberOfDays, r.deadlineDate
    ].map(v => {
      const s = String(v ?? '')
      return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(','))
    const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.setAttribute('download', `risk_report_${new Date().toISOString().slice(0,10)}.csv`)
    a.click()
  }

  const clearFilters = () => {
    setSearch(''); setStartDate(''); setEndDate('')
    setFilters({ dept: '', riskType: '', riskLevel: '', status: '' })
  }

  // ── Cell renderer ─────────────────────────────────────────────────────────────
  const renderCell = (col, row) => {
    const v = row[col.key]
    if (col.key === 'status')   return <Chip label={v} config={statusConfig} />
    if (col.key === 'riskLevel')return <Chip label={v} config={levelConfig} />
    if (col.key === 'riskScore')return (
      <span style={{ fontFamily: T.fontMono, fontWeight: 600, color: scoreColor(v) }}>{v ?? '—'}</span>
    )
    if (col.key === 'controlReference') return (
      <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.primary }}>{v || '—'}</span>
    )
    if (col.key === 'numberOfDays') return v != null ? `${v}d` : '—'
    if (col.key === 'createdAt' || col.key === 'updatedAt')
      return <span style={{ color: T.textFaint, fontSize: 11 }}>{v ? v.substring(0, 10) : '—'}</span>
    if (v == null || v === '') return <span style={{ color: T.textFaint }}>—</span>
    return v
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="rl-root" style={{ minHeight: '100vh', paddingBottom: 32 }}>

      {/* ── Top bar ── */}
      <div style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.4px', color: T.text }}>
            Risk Assessment Register
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
            {loading ? 'Loading risks…' : `${rows.length} total risks registered`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selected.size > 0 && (
            <button className="rl-btn rl-btn-danger" onClick={() => setDeleteBatch(true)}>
              <Icon name="trash" /> Delete ({selected.size})
            </button>
          )}
          <button className="rl-btn rl-btn-outline" onClick={exportCSV} disabled={loading}>
            <Icon name="download" /> Export CSV
          </button>
          <button className="rl-btn rl-btn-primary">
            <Icon name="plus" /> New Risk
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10,
        flexWrap: 'wrap', background: T.surface, borderBottom: `1px solid ${T.border}`,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160, maxWidth: 320 }}>
          <i className="ti ti-search" style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: T.textFaint, fontSize: 15, pointerEvents: 'none',
          }} />
          <input
            className="rl-search"
            placeholder="Search all columns…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: T.textFaint, fontSize: 14,
            }}>✕</button>
          )}
        </div>

        {search && (
          <span className="rl-badge">{filtered.length} of {rows.length}</span>
        )}

        <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted }}>From</span>
        <input type="date" className="rl-date-inp" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted }}>To</span>
        <input type="date" className="rl-date-inp" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <button className="rl-btn rl-btn-outline" onClick={clearFilters}>
          <Icon name="filter-off" /> Clear Filters
        </button>
      </div>

      {/* ── Table ── */}
      <div className="rl-tbl-wrap">
        <div className="rl-tbl-scroll">
          <table className="rl-table">
            <thead>
              <tr>
                {/* Checkbox */}
                <th className="th-chk">
                  <input
                    type="checkbox"
                    checked={allSel}
                    ref={el => { if (el) el.indeterminate = indeterminate }}
                    onChange={toggleAll}
                  />
                </th>

                {/* Risk ID */}
                <th className="th-id-col">
                  <div className="th-inner">
                    <span className="th-lbl"><Icon name="hash" />Risk ID</span>
                  </div>
                </th>

                {/* Dynamic columns */}
                {COLUMNS.map(col => (
                  <th key={col.key} style={{ minWidth: col.center ? 55 : 120 }}>
                    <div className="th-inner">
                      <span className="th-lbl" title={col.title}>
                        {col.icon && <Icon name={col.icon} />}
                        {col.label}
                      </span>
                      {col.filter === 'dept' && (
                        <select className="th-filter" value={filters.dept}
                          onChange={e => setFilters(p => ({ ...p, dept: e.target.value }))}>
                          <option value="">All</option>
                          {opts.dept.map(d => <option key={d}>{d}</option>)}
                        </select>
                      )}
                      {col.filter === 'riskType' && (
                        <select className="th-filter" value={filters.riskType}
                          onChange={e => setFilters(p => ({ ...p, riskType: e.target.value }))}>
                          <option value="">All</option>
                          {opts.riskType.map(t => <option key={t}>{t}</option>)}
                        </select>
                      )}
                      {col.filter === 'riskLevel' && (
                        <select className="th-filter" value={filters.riskLevel}
                          onChange={e => setFilters(p => ({ ...p, riskLevel: e.target.value }))}>
                          <option value="">All</option>
                          {opts.riskLevel.map(l => <option key={l}>{l}</option>)}
                        </select>
                      )}
                      {col.filter === 'status' && (
                        <select className="th-filter" value={filters.status}
                          onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
                          <option value="">All</option>
                          {opts.status.map(s => <option key={s}>{s}</option>)}
                        </select>
                      )}
                    </div>
                  </th>
                ))}

                {/* Actions */}
                <th className="th-act">
                  <div className="th-inner" style={{ alignItems: 'center' }}>
                    <span className="th-lbl">Actions</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={COLUMNS.length} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 3}>
                    <div className="rl-empty">
                      <i className="ti ti-database-off rl-empty-icon" />
                      <div className="rl-empty-title">No risks found</div>
                      <div className="rl-empty-sub">Try adjusting your search or filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((row, i) => {
                  const id = row._id || row.riskId
                  const sel = selected.has(id)
                  return (
                    <tr key={id} className={sel ? 'rl-sel' : ''}>
                      <td className="td-chk">
                        <input type="checkbox" checked={sel} onChange={() => toggleRow(id)} />
                      </td>
                      <td className="td-id">{row.riskId}</td>
                      {COLUMNS.map(col => (
                        <td key={col.key} style={col.center ? { textAlign: 'center', color: T.textMuted } : {}}>
                          {renderCell(col, row)}
                        </td>
                      ))}
                      <td className="td-act">
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                          <button className="abtn edit" title="Edit" aria-label="Edit">
                            <i className="ti ti-edit" />
                          </button>
                          <button className="abtn del" title="Delete" aria-label="Delete"
                            onClick={() => setDeleteSingle(id)}>
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="rl-pgbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: T.textMuted, fontSize: 12 }}>
              {filtered.length === 0 ? 'No results'
                : `Showing ${page * rowsPerPage + 1}–${Math.min((page + 1) * rowsPerPage, filtered.length)} of ${filtered.length}`}
            </span>
            <select className="rl-rpp" value={rowsPerPage}
              onChange={e => { setRowsPerPage(+e.target.value); setPage(0) }}>
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <button className="rl-pgbtn" disabled={page === 0} onClick={() => setPage(0)}>
              <i className="ti ti-chevrons-left" />
            </button>
            <button className="rl-pgbtn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <i className="ti ti-chevron-left" /> Prev
            </button>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text, padding: '0 6px' }}>
              Page {page + 1} / {totalPages}
            </span>
            <button className="rl-pgbtn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next <i className="ti ti-chevron-right" />
            </button>
            <button className="rl-pgbtn" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
              <i className="ti ti-chevrons-right" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Single Delete Dialog ── */}
      <DeleteDialog
        open={!!deleteSingle}
        title="Delete Risk"
        body={<>You are about to delete risk <strong>{deleteSingle}</strong>. This action <strong>cannot be undone</strong>.</>}
        onClose={() => setDeleteSingle(null)}
        onConfirm={confirmDeleteSingle}
        confirming={deleting}
      />

      {/* ── Batch Delete Dialog ── */}
      <DeleteDialog
        open={deleteBatch}
        title={`Delete ${selected.size} Risk${selected.size > 1 ? 's' : ''}?`}
        body={<>You are about to delete <strong>{selected.size} items</strong>. This action <strong>cannot be undone</strong>.</>}
        onClose={() => setDeleteBatch(false)}
        onConfirm={confirmDeleteBatch}
        confirming={deleting}
      />
    </div>
  )
}