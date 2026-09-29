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

const BASE_URL = 'https://api.calvant.com/risk-template-service/api/risks'

function EditRisks() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    department: '',
    date: '',
    riskType: '',
    assetType: '',
    asset: '',
    riskDescription: '',
    confidentiality: '',
    integrity: '',
    availability: '',
    probability: '',
    existingControls: '',
    additionalNotes: '',
    controlReference: '',
    additionalControls: '',
    numberOfDays: '',
    deadlineDate: '',
    status: '',
    likelihoodAfterTreatment: '',
    impactAfterTreatment: ''
  })

  // 🔹 Fetch risk by ID
  useEffect(() => {
    axios
      .get(`${BASE_URL}/${id}`)
      .then(res => {
        setForm(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        alert('Failed to load risk')
navigate('/risks/risk_sample/list')
      })
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        ...form,
        confidentiality: Number(form.confidentiality),
        integrity: Number(form.integrity),
        availability: Number(form.availability),
        probability: Number(form.probability),
        numberOfDays: Number(form.numberOfDays),
        likelihoodAfterTreatment: Number(form.likelihoodAfterTreatment),
        impactAfterTreatment: Number(form.impactAfterTreatment)
      }

      await axios.put(`${BASE_URL}/${id}`, payload)

      alert('Risk updated successfully ✅')
      navigate('/risks/risk_sample/list')
    } catch (err) {
      console.error(err)
      alert('Update failed ❌')
    }
  }

  if (loading) return <Typography sx={{ p: 2 }}>Loading...</Typography>

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Edit Risk
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12} md={6}>
              <TextField label="Department" name="department" value={form.department} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField type="date" label="Risk Date" name="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Risk Type" name="riskType" value={form.riskType} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Asset Type" name="assetType" value={form.assetType} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Asset" name="asset" value={form.asset} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Risk Description" name="riskDescription" value={form.riskDescription} onChange={handleChange} fullWidth multiline required />
            </Grid>

            <Grid item xs={4}>
              <TextField label="Confidentiality" name="confidentiality" value={form.confidentiality} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={4}>
              <TextField label="Integrity" name="integrity" value={form.integrity} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={4}>
              <TextField label="Availability" name="availability" value={form.availability} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={6}>
              <TextField label="Probability" name="probability" value={form.probability} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={6}>
              <TextField label="Number of Days" name="numberOfDays" value={form.numberOfDays} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Existing Controls" name="existingControls" value={form.existingControls} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Additional Controls" name="additionalControls" value={form.additionalControls} onChange={handleChange} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Additional Notes" name="additionalNotes" value={form.additionalNotes} onChange={handleChange} fullWidth />
            </Grid>

            <Grid item xs={6}>
              <TextField label="Control Reference" name="controlReference" value={form.controlReference} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={6}>
              <TextField type="date" label="Deadline Date" name="deadlineDate" value={form.deadlineDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
            </Grid>

            <Grid item xs={6}>
              <TextField label="Status" name="status" value={form.status} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={3}>
              <TextField label="Likelihood (After)" name="likelihoodAfterTreatment" value={form.likelihoodAfterTreatment} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={3}>
              <TextField label="Impact (After)" name="impactAfterTreatment" value={form.impactAfterTreatment} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained">
                Update Risk
              </Button>
              <Button variant="outlined" onClick={() => navigate('/risks/risk_sample/list')}>
                Cancel
              </Button>
            </Grid>

          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default EditRisks
