'use client'

// import React, { useState } from "react";
// import axios from "../../api/adminAxios";
// import { useHistory } from "react-router-dom";
// import { 
//   Box, TextField, Button, Grid, Typography, Paper, CircularProgress 
// } from "@mui/material";

// function AddRisk() {
//   const history = useHistory(); // ✅ MUST be at the top level
//   const [loading, setLoading] = useState(false);
  
//   const [form, setForm] = useState({
//     department: "",
//     date: "",
//     riskType: "",
//     assetType: "",
//     asset: "",
//     riskDescription: "",
//     confidentiality: "",
//     integrity: "",
//     availability: "",
//     probability: "",
//     existingControls: "",
//     additionalNotes: "",
//     controlReference: "",
//     additionalControls: "",
//     numberOfDays: "",
//     deadlineDate: "",
//     status: "Open",
//     likelihoodAfterTreatment: "",
//     impactAfterTreatment: ""
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Logic for Risk Score (matches your Java model)
//       const c = Number(form.confidentiality) || 0;
//       const i = Number(form.integrity) || 0;
//       const a = Number(form.availability) || 0;
//       const p = Number(form.probability) || 0;
//       const score = Math.round(((c + i + a) / 3) * p);

//       const payload = {
//         ...form,
//         confidentiality: c,
//         integrity: i,
//         availability: a,
//         probability: p,
//         numberOfDays: Number(form.numberOfDays) || 0,
//         likelihoodAfterTreatment: Number(form.likelihoodAfterTreatment) || 0,
//         impactAfterTreatment: Number(form.impactAfterTreatment) || 0,
//         riskScore: score, // Added to match your model
//         riskLevel: score >= 10 ? "High" : score >= 5 ? "Medium" : "Low"
//       };

//       const res = await axios.post(
//         `${process.env.NEXT_PUBLIC_SP}/risk-template-service/api/risks`,
//         payload
//       );

//       console.log("Success:", res.data);
//       alert("Risk created successfully ✅");
      
//       // ✅ Corrected Navigation syntax
//       history.push("/risks/risk_sample/list"); 

//     } catch (err) {
//       console.error(err);
//       alert("Failed to create risk ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ p: 4, maxWidth: 900, margin: "auto" }}>
//       <Paper elevation={3} sx={{ p: 4, borderRadius: "15px" }}>
//         <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
//           Create Single Risk Template
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           <Grid container spacing={2}>
//             <Grid item xs={12} md={6}>
//               <TextField fullWidth label="Department" name="department" onChange={handleChange} required />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField fullWidth type="date" label="Date" name="date" InputLabelProps={{ shrink: true }} onChange={handleChange} required />
//             </Grid>
            
//             <Grid item xs={12} md={4}>
//               <TextField fullWidth label="Risk Type" name="riskType" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <TextField fullWidth label="Asset Type" name="assetType" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <TextField fullWidth label="Asset" name="asset" onChange={handleChange} />
//             </Grid>

//             <Grid item xs={12}>
//               <TextField fullWidth multiline rows={2} label="Risk Description" name="riskDescription" onChange={handleChange} />
//             </Grid>

//             {/* Metrics */}
//             <Grid item xs={3}><TextField fullWidth type="number" label="Conf (1-5)" name="confidentiality" onChange={handleChange} /></Grid>
//             <Grid item xs={3}><TextField fullWidth type="number" label="Integ (1-5)" name="integrity" onChange={handleChange} /></Grid>
//             <Grid item xs={3}><TextField fullWidth type="number" label="Avail (1-5)" name="availability" onChange={handleChange} /></Grid>
//             <Grid item xs={3}><TextField fullWidth type="number" label="Prob (1-5)" name="probability" onChange={handleChange} /></Grid>

//             <Grid item xs={12} md={6}>
//               <TextField fullWidth label="Existing Controls" name="existingControls" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField fullWidth label="Additional Controls" name="additionalControls" onChange={handleChange} />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField fullWidth label="Number of Days" name="numberOfDays" type="number" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField fullWidth type="date" label="Deadline Date" name="deadlineDate" InputLabelProps={{ shrink: true }} onChange={handleChange} />
//             </Grid>

//             <Grid item xs={12}>
//               <Button 
//                 type="submit" 
//                 variant="contained" 
//                 fullWidth 
//                 size="large"
//                 disabled={loading}
//                 sx={{ mt: 2, height: 50 }}
//               >
//                 {loading ? <CircularProgress size={24} color="inherit" /> : "Create Risk"}
//               </Button>
//             </Grid>
//           </Grid>
//         </form>
//       </Paper>
//     </Box>
//   );
// }

// export default AddRisk;


import React, { useState } from "react";
// import axios from "../../api/adminAxios";
// import { useHistory } from "react-router-dom";

/* ─── Design tokens (inline, no Tailwind compiler needed) ─── */
const t = {
  bg: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceMuted: "#F8FAFC",
  border: "#E8ECF2",
  borderFocus: "#3B6FDB",
  text: "#111827",
  textSub: "#6B7280",
  textHint: "#9CA3AF",
  blue: "#2B5CE6",
  blueDark: "#1D47C4",
  blueLight: "#EEF3FF",
  bluePill: "#DBEAFE",
  bluePillText: "#1E3FAE",
  red: "#E53E3E",
  green: "#16A34A",
  amber: "#B45309",
  scoreHigh: "#DC2626",
  scoreMed: "#D97706",
  scoreLow: "#16A34A",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ar-root {
    background: ${t.bg};
    min-height: 100vh;
    padding: 32px 24px 64px;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: ${t.text};
  }

  .ar-wrap { max-width: 920px; margin: 0 auto; }

  /* Breadcrumb */
  .ar-crumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 11.5px; color: ${t.textHint};
    margin-bottom: 18px; font-weight: 500; letter-spacing: .2px;
  }
  .ar-crumb-link { color: ${t.blue}; cursor: pointer; }
  .ar-crumb-sep { opacity: .4; }

  /* Page header */
  .ar-header { margin-bottom: 24px; }
  .ar-header-inner { display: flex; align-items: flex-start; justify-content: space-between; }
  .ar-title { font-size: 22px; font-weight: 700; letter-spacing: -.4px; color: ${t.text}; }
  .ar-sub { font-size: 13px; color: ${t.textSub}; margin-top: 4px; }
  .ar-badge {
    background: ${t.blueLight}; color: ${t.blue};
    font-size: 11px; font-weight: 700; letter-spacing: .6px;
    padding: 4px 12px; border-radius: 20px; text-transform: uppercase;
    margin-top: 2px;
  }

  /* Card shell */
  .ar-card {
    background: ${t.surface};
    border: 1px solid ${t.border};
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,.04), 0 4px 24px rgba(0,0,0,.03);
  }

  /* Section */
  .ar-section-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 28px;
    background: ${t.surfaceMuted};
    border-bottom: 1px solid ${t.border};
  }
  .ar-section-num {
    width: 24px; height: 24px; border-radius: 50%;
    background: ${t.blue}; color: #fff;
    font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; letter-spacing: 0;
  }
  .ar-section-title {
    font-size: 11px; font-weight: 700;
    color: #374151; text-transform: uppercase; letter-spacing: 1px;
  }
  .ar-section-body { padding: 22px 28px; }

  /* Grids */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .g4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
  .mb { margin-bottom: 16px; }

  /* Field */
  .ar-field { display: flex; flex-direction: column; gap: 5px; }
  .ar-label {
    font-size: 11px; font-weight: 700;
    color: #4B5563; letter-spacing: .3px;
    display: flex; align-items: center; gap: 3px;
  }
  .ar-req { color: ${t.red}; line-height: 1; }
  .ar-input, .ar-textarea {
    background: ${t.surfaceMuted};
    border: 1px solid ${t.border};
    border-radius: 10px;
    padding: 9px 13px;
    font-size: 13px; font-weight: 400;
    color: ${t.text};
    font-family: 'DM Sans', system-ui, sans-serif;
    outline: none;
    transition: border-color .15s, background .15s, box-shadow .15s;
    width: 100%;
  }
  .ar-input:focus, .ar-textarea:focus {
    border-color: ${t.borderFocus};
    background: #fff;
    box-shadow: 0 0 0 3px rgba(43,92,230,.1);
  }
  .ar-input::placeholder, .ar-textarea::placeholder { color: #D1D5DB; }
  .ar-textarea { resize: none; }
  .ar-metric-hint {
    display: flex; justify-content: space-between;
    font-size: 10px; color: ${t.textHint}; font-weight: 500; margin-top: 2px;
  }

  /* Score card */
  .ar-score {
    background: linear-gradient(135deg, #EEF3FF 0%, #F0F7FF 100%);
    border: 1px solid #C7D7FD;
    border-radius: 14px;
    padding: 16px 22px;
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 4px;
  }
  .ar-score-label {
    font-size: 10.5px; font-weight: 700; color: #3B5BDB;
    text-transform: uppercase; letter-spacing: .8px;
  }
  .ar-score-formula { font-size: 10px; color: #748FFC; margin-top: 3px; }
  .ar-score-val {
    font-size: 30px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: ${t.blue}; line-height: 1;
  }
  .ar-score-level {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 700; letter-spacing: .5px;
    text-transform: uppercase; padding: 2px 8px;
    border-radius: 20px; margin-top: 5px;
  }
  .ar-score-level.high { background: #FEE2E2; color: #B91C1C; }
  .ar-score-level.medium { background: #FEF3C7; color: #92400E; }
  .ar-score-level.low { background: #D1FAE5; color: #065F46; }

  /* Status selector */
  .ar-status-row { display: flex; gap: 8px; margin-top: 4px; }
  .ar-status-opt {
    flex: 1; border: 1.5px solid ${t.border};
    border-radius: 10px; padding: 9px 8px;
    text-align: center; cursor: pointer;
    font-size: 12px; font-weight: 700;
    color: ${t.textSub}; background: ${t.surfaceMuted};
    transition: all .15s; user-select: none;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .ar-status-opt:hover { border-color: #C7D7FD; background: #F5F8FF; color: ${t.blue}; }
  .ar-status-opt.active {
    border-color: ${t.blue}; background: ${t.blueLight}; color: ${t.blue};
  }

  /* Divider */
  .ar-divider { height: 1px; background: ${t.border}; }

  /* Footer */
  .ar-footer {
    padding: 18px 28px;
    background: ${t.surfaceMuted};
    border-top: 1px solid ${t.border};
    display: flex; align-items: center; justify-content: space-between;
  }
  .ar-btn-cancel {
    background: #fff; border: 1px solid ${t.border};
    color: ${t.textSub}; font-size: 13px; font-weight: 600;
    padding: 10px 24px; border-radius: 10px; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: border-color .15s, color .15s;
  }
  .ar-btn-cancel:hover { border-color: #C7D7FD; color: ${t.blue}; }
  .ar-btn-submit {
    background: ${t.blue}; border: none; color: #fff;
    font-size: 13px; font-weight: 700;
    padding: 10px 32px; border-radius: 10px; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    letter-spacing: .2px;
    transition: background .15s, transform .1s, box-shadow .15s;
    display: flex; align-items: center; gap: 8px;
  }
  .ar-btn-submit:hover { background: ${t.blueDark}; box-shadow: 0 4px 14px rgba(43,92,230,.35); }
  .ar-btn-submit:active { transform: scale(.98); }
  .ar-btn-submit:disabled { background: #93A8E8; cursor: not-allowed; box-shadow: none; }
  .ar-footer-hint { font-size: 11px; color: ${t.textHint}; }

  /* Spinner */
  .ar-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ar-spin .7s linear infinite;
  }
  @keyframes ar-spin { to { transform: rotate(360deg); } }

  /* Score bar */
  .ar-score-bars { display: flex; gap: 3px; margin-top: 4px; }
  .ar-score-bar {
    height: 4px; flex: 1; border-radius: 2px;
    background: #C7D7FD; transition: background .3s;
  }
  .ar-score-bar.filled { background: ${t.blue}; }
`;

function Field({ label, required, children }) {
  return (
    <div className="ar-field">
      <label className="ar-label">
        {label}{required && <span className="ar-req">*</span>}
      </label>
      {children}
    </div>
  );
}

function ScoreLevel({ score }) {
  if (!score && score !== 0) return null;
  if (score >= 10) return <div className="ar-score-level high">● High Risk</div>;
  if (score >= 5) return <div className="ar-score-level medium">● Medium Risk</div>;
  return <div className="ar-score-level low">● Low Risk</div>;
}

function ScoreBars({ score, max = 25 }) {
  const filled = score ? Math.round((score / max) * 5) : 0;
  return (
    <div className="ar-score-bars">
      {[1,2,3,4,5].map(i => (
        <div
          key={i}
          className={`ar-score-bar${i <= filled ? " filled" : ""}`}
          style={i <= filled ? {
            background: score >= 10 ? "#E53E3E" : score >= 5 ? "#D97706" : "#16A34A"
          } : {}}
        />
      ))}
    </div>
  );
}

export default function AddRisk() {
  // const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    department: "", date: "", riskType: "", assetType: "", asset: "",
    riskDescription: "", confidentiality: "", integrity: "", availability: "",
    probability: "", existingControls: "", additionalNotes: "",
    controlReference: "", additionalControls: "", numberOfDays: "",
    deadlineDate: "", status: "Open", likelihoodAfterTreatment: "", impactAfterTreatment: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const setStatus = (s) => setForm(prev => ({ ...prev, status: s }));

  const calcScore = () => {
    const c = Number(form.confidentiality) || 0;
    const i = Number(form.integrity) || 0;
    const a = Number(form.availability) || 0;
    const p = Number(form.probability) || 0;
    if (!c && !i && !a && !p) return null;
    return Math.round(((c + i + a) / 3) * p);
  };

  const score = calcScore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const c = Number(form.confidentiality) || 0;
      const i = Number(form.integrity) || 0;
      const a = Number(form.availability) || 0;
      const p = Number(form.probability) || 0;
      const riskScore = Math.round(((c + i + a) / 3) * p);
      const payload = {
        ...form, confidentiality: c, integrity: i, availability: a,
        probability: p, numberOfDays: Number(form.numberOfDays) || 0,
        likelihoodAfterTreatment: Number(form.likelihoodAfterTreatment) || 0,
        impactAfterTreatment: Number(form.impactAfterTreatment) || 0,
        riskScore, riskLevel: riskScore >= 10 ? "High" : riskScore >= 5 ? "Medium" : "Low",
      };
      // const res = await axios.post(`${process.env.NEXT_PUBLIC_SP}/risk-template-service/api/risks`, payload);
      console.log("Payload:", payload);
      alert("Risk created successfully ✅");
      // history.push("/risks/risk_sample/list");
    } catch (err) {
      console.error(err);
      alert("Failed to create risk ❌");
    } finally {
      setLoading(false);
    }
  };

  const inp = (name, extra = {}) => (
    <input
      className="ar-input"
      name={name}
      value={form[name]}
      onChange={handleChange}
      {...extra}
    />
  );

  return (
    <>
      <style>{css}</style>
      <div className="ar-root">
        <div className="ar-wrap">

          {/* Breadcrumb */}
          <div className="ar-crumb">
            <span className="ar-crumb-link">Risks</span>
            <span className="ar-crumb-sep">/</span>
            <span>Create Risk Template</span>
          </div>

          {/* Header */}
          <div className="ar-header">
            <div className="ar-header-inner">
              <div>
                <div className="ar-title">Create Risk Template</div>
                <div className="ar-sub">Fill in all required fields to register a new risk entry</div>
              </div>
              <div className="ar-badge">New Entry</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ar-card">

              {/* ── Section 1 ── */}
              <div className="ar-section-bar">
                <div className="ar-section-num">1</div>
                <div className="ar-section-title">Basic Information</div>
              </div>
              <div className="ar-section-body">
                <div className="g2 mb">
                  <Field label="Department" required>
                    {inp("department", { placeholder: "e.g. Engineering" })}
                  </Field>
                  <Field label="Date" required>
                    {inp("date", { type: "date" })}
                  </Field>
                </div>
                <div className="g3">
                  <Field label="Risk Type">
                    {inp("riskType", { placeholder: "e.g. Cyber, Operational" })}
                  </Field>
                  <Field label="Asset Type">
                    {inp("assetType", { placeholder: "e.g. Hardware, Software" })}
                  </Field>
                  <Field label="Asset">
                    {inp("asset", { placeholder: "e.g. Web Server" })}
                  </Field>
                </div>
              </div>

              <div className="ar-divider" />

              {/* ── Section 2 ── */}
              <div className="ar-section-bar">
                <div className="ar-section-num">2</div>
                <div className="ar-section-title">Risk Description</div>
              </div>
              <div className="ar-section-body">
                <Field label="Risk Description">
                  <textarea
                    className="ar-textarea"
                    name="riskDescription"
                    rows={3}
                    value={form.riskDescription}
                    onChange={handleChange}
                    placeholder="Describe the risk in detail — what could go wrong, who is affected, and what the potential impact is…"
                  />
                </Field>
              </div>

              <div className="ar-divider" />

              {/* ── Section 3 ── */}
              <div className="ar-section-bar">
                <div className="ar-section-num">3</div>
                <div className="ar-section-title">Risk Metrics — CIA &amp; Probability</div>
              </div>
              <div className="ar-section-body">
                <div className="g4 mb">
                  {[
                    { name: "confidentiality", label: "Confidentiality", l: "Low", r: "High" },
                    { name: "integrity",       label: "Integrity",       l: "Low", r: "High" },
                    { name: "availability",    label: "Availability",    l: "Low", r: "High" },
                    { name: "probability",     label: "Probability",     l: "Rare", r: "Certain" },
                  ].map(({ name, label, l, r }) => (
                    <Field key={name} label={label}>
                      {inp(name, { type: "number", min: 1, max: 5, placeholder: "1 – 5" })}
                      <div className="ar-metric-hint"><span>{l}</span><span>{r}</span></div>
                    </Field>
                  ))}
                </div>

                <div className="ar-score">
                  <div>
                    <div className="ar-score-label">Calculated Risk Score</div>
                    <div className="ar-score-formula">avg(C + I + A) × Probability</div>
                    {score !== null && (
                      <>
                        <ScoreBars score={score} />
                        <ScoreLevel score={score} />
                      </>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      className="ar-score-val"
                      style={score !== null ? {
                        color: score >= 10 ? t.scoreHigh : score >= 5 ? t.scoreMed : t.scoreLow
                      } : {}}
                    >
                      {score !== null ? score : "—"}
                    </div>
                    <div style={{ fontSize: 10, color: "#748FFC", marginTop: 4 }}>
                      {score === null ? "Fill metrics above to calculate" : `out of 25 max`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ar-divider" />

              {/* ── Section 4 ── */}
              <div className="ar-section-bar">
                <div className="ar-section-num">4</div>
                <div className="ar-section-title">Controls &amp; Treatment</div>
              </div>
              <div className="ar-section-body">
                <div className="g2 mb">
                  <Field label="Existing Controls">
                    {inp("existingControls", { placeholder: "Controls already in place" })}
                  </Field>
                  <Field label="Additional Controls">
                    {inp("additionalControls", { placeholder: "Recommended new controls" })}
                  </Field>
                </div>
                <div className="g2 mb">
                  <Field label="Control Reference">
                    {inp("controlReference", { placeholder: "e.g. ISO 27001 A.8.2" })}
                  </Field>
                  <Field label="Additional Notes">
                    {inp("additionalNotes", { placeholder: "Any supplementary context" })}
                  </Field>
                </div>
                <div className="g2">
                  <Field label="Likelihood After Treatment">
                    {inp("likelihoodAfterTreatment", { type: "number", min: 1, max: 5, placeholder: "1 – 5" })}
                  </Field>
                  <Field label="Impact After Treatment">
                    {inp("impactAfterTreatment", { type: "number", min: 1, max: 5, placeholder: "1 – 5" })}
                  </Field>
                </div>
              </div>

              <div className="ar-divider" />

              {/* ── Section 5 ── */}
              <div className="ar-section-bar">
                <div className="ar-section-num">5</div>
                <div className="ar-section-title">Timeline &amp; Status</div>
              </div>
              <div className="ar-section-body">
                <div className="g2 mb">
                  <Field label="Number of Days">
                    {inp("numberOfDays", { type: "number", placeholder: "Remediation window in days" })}
                  </Field>
                  <Field label="Deadline Date">
                    {inp("deadlineDate", { type: "date" })}
                  </Field>
                </div>
                <Field label="Status">
                  <div className="ar-status-row">
                    {["Open", "In Progress", "Closed", "Deferred"].map(s => (
                      <div
                        key={s}
                        className={`ar-status-opt${form.status === s ? " active" : ""}`}
                        onClick={() => setStatus(s)}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </Field>
              </div>

              {/* Footer */}
              <div className="ar-footer">
                <button type="button" className="ar-btn-cancel">Cancel</button>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span className="ar-footer-hint">All required fields must be filled before submitting</span>
                  <button type="submit" className="ar-btn-submit" disabled={loading}>
                    {loading
                      ? <><div className="ar-spinner" /> Submitting…</>
                      : "Create Risk"}
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}