import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// Hooks
import useDebounce from '../../utils/hook/useDebounce'

// MUI
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

const API_URL = 'https://api.calvant.com/seo-form/api/seo'
function SEO_form_List() {
  const navigate = useNavigate()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null })
  const [confirmText, setConfirmText] = useState('')

  // filters
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [keyword, setKeyword] = useState('')

  // debounced filters
  const dUrl = useDebounce(url)
  const dTitle = useDebounce(title)
  const dKeyword = useDebounce(keyword)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(API_URL)

      // if backend returns { data: [...] } use res.data.data
      const responseData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []

      setData(responseData)
    } catch (err) {
      console.error('Fetch Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDelete = (id) => {
    setConfirmDialog({ open: true, id })
    setConfirmText('')
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`${API_URL}/${confirmDialog.id}`)
      setConfirmDialog({ open: false, id: null })
      setConfirmText('')
      fetchData()
    } catch (err) {
      console.error('Delete Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, id: null })
    setConfirmText('')
  }

  const filteredData = data.filter((item) => {
    const matchUrl =
      item.url?.toLowerCase().includes(dUrl.toLowerCase()) ?? true

    const matchTitle =
      item.pageTitle?.toLowerCase().includes(dTitle.toLowerCase()) ?? true

    const matchKeyword =
      item.metaKeywords?.toLowerCase().includes(dKeyword.toLowerCase()) ?? true

    return matchUrl && matchTitle && matchKeyword
  })

  return (
    <>
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table sx={{ minWidth: 650, tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>

            <TableCell width="20%">
              <Stack spacing={1}>
                <strong>URL</strong>
                <TextField
                  variant="standard"
                  size="small"
                  placeholder="Search..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </Stack>
            </TableCell>

            <TableCell width="20%">
              <Stack spacing={1}>
                <strong>PAGE TITLE</strong>
                <TextField
                  variant="standard"
                  size="small"
                  placeholder="Search..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Stack>
            </TableCell>

            <TableCell width="20%">
              <Stack spacing={1}>
                <strong>KEYWORDS</strong>
                <TextField
                  variant="standard"
                  size="small"
                  placeholder="Search..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </Stack>
            </TableCell>

            <TableCell><strong>META DESC</strong></TableCell>
            <TableCell width={90}><strong>EDIT</strong></TableCell>
            <TableCell width={100}><strong>ACTION</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Box py={4}>
                  <CircularProgress />
                </Box>
              </TableCell>
            </TableRow>
          ) : filteredData.length ? (
            filteredData.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ wordBreak: 'break-word' }}>{row.url}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{row.pageTitle}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{row.metaKeywords}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{row.metaDesc}</TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color="inherit"
                    size="small"
                    onClick={() => navigate(`/seo_form/edit/${row.id}`)}
                  >
                    Edit
                  </Button>
                </TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color="inherit"
                    size="small"
                    onClick={() => handleOpenDelete(row.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

      <Dialog open={confirmDialog.open} onClose={handleCancelDelete}>
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
          <Button onClick={handleCancelDelete}>Cancel</Button>
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
    </>
  )
}

export default SEO_form_List
