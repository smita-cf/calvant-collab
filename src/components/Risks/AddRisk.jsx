import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Box, TextField, Button, Grid, Typography, Paper, CircularProgress 
} from "@mui/material";

function AddRisk() {
  const navigate = useNavigate(); // ✅ MUST be at the top level
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    department: "",
    date: "",
    riskType: "",
    assetType: "",
    asset: "",
    riskDescription: "",
    confidentiality: "",
    integrity: "",
    availability: "",
    probability: "",
    existingControls: "",
    additionalNotes: "",
    controlReference: "",
    additionalControls: "",
    numberOfDays: "",
    deadlineDate: "",
    status: "Open",
    likelihoodAfterTreatment: "",
    impactAfterTreatment: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic for Risk Score (matches your Java model)
      const c = Number(form.confidentiality) || 0;
      const i = Number(form.integrity) || 0;
      const a = Number(form.availability) || 0;
      const p = Number(form.probability) || 0;
      const score = Math.round(((c + i + a) / 3) * p);

      const payload = {
        ...form,
        confidentiality: c,
        integrity: i,
        availability: a,
        probability: p,
        numberOfDays: Number(form.numberOfDays) || 0,
        likelihoodAfterTreatment: Number(form.likelihoodAfterTreatment) || 0,
        impactAfterTreatment: Number(form.impactAfterTreatment) || 0,
        riskScore: score, // Added to match your model
        riskLevel: score >= 10 ? "High" : score >= 5 ? "Medium" : "Low"
      };

      const res = await axios.post(
        "https://api.calvant.com/risk-template-service/api/risks",
        payload
      );

      console.log("Success:", res.data);
      alert("Risk created successfully ✅");
      
      // ✅ Corrected Navigation syntax
      navigate("/risks/risk_sample/list"); 

    } catch (err) {
      console.error(err);
      alert("Failed to create risk ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, margin: "auto" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: "15px" }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Create Single Risk Template
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Department" name="department" onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Date" name="date" InputLabelProps={{ shrink: true }} onChange={handleChange} required />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Risk Type" name="riskType" onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Asset Type" name="assetType" onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Asset" name="asset" onChange={handleChange} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Risk Description" name="riskDescription" onChange={handleChange} />
            </Grid>

            {/* Metrics */}
            <Grid item xs={3}><TextField fullWidth type="number" label="Conf (1-5)" name="confidentiality" onChange={handleChange} /></Grid>
            <Grid item xs={3}><TextField fullWidth type="number" label="Integ (1-5)" name="integrity" onChange={handleChange} /></Grid>
            <Grid item xs={3}><TextField fullWidth type="number" label="Avail (1-5)" name="availability" onChange={handleChange} /></Grid>
            <Grid item xs={3}><TextField fullWidth type="number" label="Prob (1-5)" name="probability" onChange={handleChange} /></Grid>

            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Existing Controls" name="existingControls" onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Additional Controls" name="additionalControls" onChange={handleChange} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Number of Days" name="numberOfDays" type="number" onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Deadline Date" name="deadlineDate" InputLabelProps={{ shrink: true }} onChange={handleChange} />
            </Grid>

            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large"
                disabled={loading}
                sx={{ mt: 2, height: 50 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Risk"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default AddRisk;