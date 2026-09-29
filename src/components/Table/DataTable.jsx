import React, { useEffect, useMemo, useState } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Paper, Box, TextField, InputAdornment,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const DataTable = ({
  tableName = 'datatable',
  api = {},
  columns = [],
  actions = {},
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10
}) => {
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize)
  const [search, setSearch] = useState('')
  const [viewRow, setViewRow] = useState(null)

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!api.fetch) return
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get(api.fetch)
      setRows(res.data || [])
    } catch (e) {
      console.error('Fetch failed', e)
    } finally {
      setLoading(false)
    }
  }

  /* ================= ACTION HANDLERS ================= */

  const handleView = (row) => {
    if (actions.view?.mode === 'modal') setViewRow(row)
    if (actions.view?.mode === 'page')
      navigate(`${actions.view.path}/${row.id}`)
    if (actions.view?.mode === 'new-tab')
      window.open(`${actions.view.path}/${row.id}`, '_blank')
  }

  const handleEdit = (row) => {
    if (actions.edit?.mode === 'page')
      navigate(`${actions.edit.path}/${row.id}`)
    if (actions.edit?.mode === 'new-tab')
      window.open(`${actions.edit.path}/${row.id}`, '_blank')
  }

  const handleAdd = () => {
    if (actions.add?.mode === 'page')
      navigate(actions.add.path)
    if (actions.add?.mode === 'new-tab')
      window.open(actions.add.path, '_blank')
  }

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this record?')) return
    try {
      const url = typeof api.delete === 'function'
        ? api.delete(row.id)
        : `${api.delete}/${row.id}`
      await axios.delete(url)
      fetchData()
    } catch (e) {
      alert('Delete failed')
    }
  }

  /* ================= FILTER ================= */

  const filteredRows = useMemo(() => {
    if (!search) return rows
    return rows.filter(row =>
      columns.some(col =>
        String(row[col.field] || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    )
  }, [rows, search, columns])

  const paginated = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  /* ================= RENDER ================= */

  return (
    <Box>
      {/* SEARCH + ADD */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />

        {actions.add?.enabled && (
          <IconButton color="primary" onClick={handleAdd}>
            <AddIcon />
          </IconButton>
        )}
      </Box>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map(col => (
                  <TableCell key={col.field}>{col.headerName}</TableCell>
                ))}
                {actions && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginated.map(row => (
                <TableRow key={row.id}>
                  {columns.map(col => (
                    <TableCell key={col.field}>
                      {row[col.field] ?? '-'}
                    </TableCell>
                  ))}

                  {/* ACTION BUTTONS */}
                  <TableCell>
                    {actions.view?.enabled && (
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => handleView(row)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {actions.edit?.enabled && (
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(row)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {actions.delete?.enabled && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(row)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={pageSizeOptions}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value)
            setPage(0)
          }}
        />
      </Paper>

      {/* VIEW MODAL */}
      <Dialog open={!!viewRow} onClose={() => setViewRow(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          View Details
          <IconButton onClick={() => setViewRow(null)} sx={{ float: 'right' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(viewRow, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default DataTable
