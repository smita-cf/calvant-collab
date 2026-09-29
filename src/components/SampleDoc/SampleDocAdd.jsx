import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Typography, Paper, TextField, Stack, Chip,
  CircularProgress, Snackbar, Alert, IconButton
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import axios from 'axios'

const BASE_URL = 'https://api.calvant.com/docs/api/docs'

const FIELDS = {
  TYPE:       { bg: '#FFF1E6', text: '#C2410C', dot: '#F97316' },
  DEPARTMENT: { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  DOCUMENTS:  { bg: '#EEF2FF', text: '#3730A3', dot: '#6366F1' },
}

const SectionLabel = ({ children, dot }) => (
  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dot }} />
    <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#64748B', textTransform: 'uppercase' }}>
      {children}
    </Typography>
  </Stack>
)

const ChipField = ({ fieldKey, list, input, setInput, placeholder, onAdd, onRemove, onKeyDown }) => {
  const { bg, text, dot } = FIELDS[fieldKey]
  return (
    <Box>
      <SectionLabel dot={dot}>{fieldKey}</SectionLabel>
      <Box
        onClick={() => document.getElementById(`chipinput-${fieldKey}`)?.focus()}
        sx={{
          p: '10px 12px', minHeight: 58, display: 'flex',
          flexWrap: 'wrap', gap: '6px', alignItems: 'center',
          border: '1.5px solid #E2E8F0', borderRadius: '12px',
          cursor: 'text', bgcolor: '#FAFBFC',
          transition: 'all 0.18s ease',
          '&:focus-within': { borderColor: dot, bgcolor: '#FFFFFF', boxShadow: `0 0 0 3px ${dot}22` },
        }}
      >
        {list.map((item, idx) => (
          <Chip key={idx} label={item} size="small" onDelete={() => onRemove(idx)}
            sx={{
              bgcolor: bg, color: text,
              fontFamily: '"DM Mono", monospace', fontSize: '11.5px', fontWeight: 600,
              height: 26, border: `1px solid ${text}22`,
              '& .MuiChip-deleteIcon': { color: text, opacity: 0.5, fontSize: '14px', '&:hover': { opacity: 1 } },
            }}
          />
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 100 }}>
          <input
            id={`chipinput-${fieldKey}`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={list.length === 0 ? placeholder : 'Add more…'}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '13px', fontFamily: 'inherit', color: '#1E293B',
              flex: 1, padding: '2px 4px', minWidth: 80,
            }}
          />
          {input.trim() && (
            <IconButton size="small" onClick={onAdd}
              sx={{ color: dot, bgcolor: bg, width: 22, height: 22, '&:hover': { bgcolor: bg } }}>
              <AddIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
      </Box>
      <Typography sx={{ fontSize: '11px', color: '#94A3B8', mt: '5px', fontFamily: '"DM Mono", monospace' }}>
        ↵ Enter or , to add • Backspace to remove last
      </Typography>
    </Box>
  )
}

function SampleDocAdd() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [clause, setClause] = useState('')
  const [type, setType] = useState([])
  const [dept, setDept] = useState([])
  const [docs, setDocs] = useState([])
  const [typeInput, setTypeInput] = useState('')
  const [deptInput, setDeptInput] = useState('')
  const [docsInput, setDocsInput] = useState('')

  const handleSave = async () => {
    if (!clause.trim()) {
      setSnackbar({ open: true, message: 'Clause is required', severity: 'warning' })
      return
    }
    setSaving(true)
    try {
      await axios.post(BASE_URL, { clause: clause.trim(), type, dept, docs })
      setSnackbar({ open: true, message: 'Document added successfully', severity: 'success' })
      setTimeout(() => navigate(-1), 1200)
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Save failed', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const addChip = (list, setList, input, setInput) => {
    const val = input.trim()
    if (val && !list.includes(val)) setList([...list, val])
    setInput('')
  }
  const removeChip = (list, setList, idx) => setList(list.filter((_, i) => i !== idx))
  const handleKeyDown = (e, list, setList, input, setInput) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addChip(list, setList, input, setInput) }
    if (e.key === 'Backspace' && !input && list.length > 0) removeChip(list, setList, list.length - 1)
  }

  const isEmpty = !clause.trim() && !type.length && !dept.length && !docs.length

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', p: { xs: 2, md: 4 } }}>
      {/* Top bar */}
      <Box sx={{ maxWidth: 720, mx: 'auto', mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ bgcolor: '#FFFFFF', border: '1.5px solid #E2E8F0', color: '#475569', borderRadius: '10px', width: 38, height: 38, '&:hover': { bgcolor: '#F1F5F9' } }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', fontFamily: '"Fraunces", serif', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              New Document
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontFamily: '"DM Mono", monospace', mt: '2px' }}>
              Fill in the clause and tag it
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Card */}
      <Paper elevation={0} sx={{ maxWidth: 720, mx: 'auto', borderRadius: '20px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #F97316 0%, #6366F1 50%, #10B981 100%)' }} />

        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={4}>
            {/* Clause */}
            <Box>
              <SectionLabel dot="#0EA5E9">Clause *</SectionLabel>
              <TextField
                fullWidth size="small"
                value={clause}
                onChange={e => setClause(e.target.value)}
                placeholder="e.g. 5.1"
                InputProps={{ sx: { fontFamily: '"DM Mono", monospace', fontSize: '14px', fontWeight: 600 } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px', bgcolor: '#FAFBFC',
                    '& fieldset': { borderColor: '#E2E8F0', borderWidth: '1.5px' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#0EA5E9', boxShadow: '0 0 0 3px #0EA5E922' },
                  }
                }}
              />
            </Box>

            <Box sx={{ height: '1px', bgcolor: '#F1F5F9' }} />

            <ChipField fieldKey="TYPE" list={type} input={typeInput} setInput={setTypeInput}
              placeholder="POL, DOC, REC…"
              onAdd={() => addChip(type, setType, typeInput, setTypeInput)}
              onRemove={idx => removeChip(type, setType, idx)}
              onKeyDown={e => handleKeyDown(e, type, setType, typeInput, setTypeInput)}
            />
            <ChipField fieldKey="DEPARTMENT" list={dept} input={deptInput} setInput={setDeptInput}
              placeholder="ISMS Steering Committee…"
              onAdd={() => addChip(dept, setDept, deptInput, setDeptInput)}
              onRemove={idx => removeChip(dept, setDept, idx)}
              onKeyDown={e => handleKeyDown(e, dept, setDept, deptInput, setDeptInput)}
            />
            <ChipField fieldKey="DOCUMENTS" list={docs} input={docsInput} setInput={setDocsInput}
              placeholder="Information Security Policy…"
              onAdd={() => addChip(docs, setDocs, docsInput, setDocsInput)}
              onRemove={idx => removeChip(docs, setDocs, idx)}
              onKeyDown={e => handleKeyDown(e, docs, setDocs, docsInput, setDocsInput)}
            />

            <Box sx={{ height: '1px', bgcolor: '#F1F5F9' }} />

            {/* Actions */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                onClick={() => navigate(-1)}
                disabled={saving}
                sx={{
                  borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                  fontSize: '13.5px', px: 3, color: '#64748B',
                  border: '1.5px solid #E2E8F0', bgcolor: '#FFFFFF',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                  fontSize: '13.5px', px: 3,
                  background: saving ? '#E2E8F0' : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  color: saving ? '#94A3B8' : '#FFFFFF',
                  boxShadow: saving ? 'none' : '0 2px 12px rgba(15,23,42,0.25)',
                  '&:hover': { background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', boxShadow: '0 4px 18px rgba(15,23,42,0.3)' },
                  '&.Mui-disabled': { background: '#E2E8F0', color: '#94A3B8' },
                  transition: 'all 0.2s ease',
                }}
              >
                {saving ? 'Saving…' : 'Add Document'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600, fontSize: '13px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default SampleDocAdd