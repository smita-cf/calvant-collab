import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography
} from '@mui/material'
import axios from 'axios'

const BASE_URL = 'https://api.calvant.com/gap-questions/api/gaps'

/* =========================
   Helper: normalize to array
   ========================= */
const toCleanArray = (val) => {
  if (!val) return []

  // If already array
  if (Array.isArray(val)) {
    return val
      .flatMap(v => String(v).split(/[\n,]/))
      .map(v => v.replace(/^"+|"+$/g, '').trim())
      .filter(Boolean)
  }

  // If string
  return String(val)
    .split(/[\n,]/)
    .map(v => v.replace(/^"+|"+$/g, '').trim())
    .filter(Boolean)
}

function EditGap() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    clause: '',
    standardRequirement: '',
    auditQuestions: '',
    department: ''
  })

  /* =========================
     Fetch gap by ID
     ========================= */
  useEffect(() => {
    if (!id) return

    const fetchGap = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/${id}`)
        const data = res.data || {}

        setForm({
          clause: data.clause || '',
          standardRequirement: data.standardRequirement || '',
          auditQuestions: toCleanArray(data.auditQuestions).join('\n'),
          department: toCleanArray(data.department).join('\n')
        })

        setLoading(false)
      } catch (err) {
        console.error('Fetch failed', err)
        alert('Failed to load gap')
        navigate('/gap/list')
      }
    }

    fetchGap()
  }, [id, navigate])

  /* =========================
     Handle input change
     ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  /* =========================
     Submit update
     ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        clause: form.clause.trim(),
        standardRequirement: form.standardRequirement.trim(),
        auditQuestions: toCleanArray(form.auditQuestions),
        department: toCleanArray(form.department)
      }

      await axios.put(`${BASE_URL}/${id}`, payload)

      alert('Gap updated successfully ✅')
      navigate('/gap/list')
    } catch (err) {
      console.error('Update failed', err)
      alert('Update failed ❌')
    }
  }

  /* =========================
     Loading state
     ========================= */
  if (loading) {
    return (
      <Typography sx={{ p: 2 }}>
        Loading gap details...
      </Typography>
    )
  }

  /* =========================
     UI
     ========================= */
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Edit Gap Question
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12} md={4}>
              <TextField
                label="Clause"
                name="clause"
                value={form.clause}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                label="Standard Requirement"
                name="standardRequirement"
                value={form.standardRequirement}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Audit Questions (comma or new line separated)"
                name="auditQuestions"
                value={form.auditQuestions}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={4}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Department (comma or new line separated)"
                name="department"
                value={form.department}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={3}
                required
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained">
                Update Gap
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/gap/list')}
              >
                Cancel
              </Button>
            </Grid>

          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default EditGap
