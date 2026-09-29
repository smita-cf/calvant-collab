import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Stack
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "https://api.calvant.com/gap-questions/api/gaps";

// Motion components
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionGrid = motion(Grid);
const MotionChip = motion(Chip);

// Styled components for better design
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: "16px",
  background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#fafbfc",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3b82f6"
      }
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "2px",
        borderColor: "#3b82f6"
      }
    }
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    "&.Mui-focused": {
      color: "#3b82f6",
      fontWeight: 600
    }
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  height: "56px",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
  "&:hover": {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    boxShadow: "0 6px 24px rgba(59, 130, 246, 0.4)",
  },
  "&:disabled": {
    background: "#e5e7eb",
    boxShadow: "none"
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  borderBottom: "2px solid",
  borderImage: "linear-gradient(90deg, #3b82f6 0%, transparent 100%) 1"
}));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20
    }
  }
};

const chipVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0,
    y: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      duration: 0.2
    }
  }
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.02,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { 
    scale: 0.98,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

function AddGap() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clause: "",
    standardRequirement: "",
    auditQuestions: "",
    department: ""
  });

  const toCleanArray = (value) => {
  if (!value) return [];
  return value
    .split(",")
    .map(v => v.replace(/^"+|"+$/g, "").trim())
    .filter(Boolean);
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = {
      clause: form.clause.trim(),
      standardRequirement: form.standardRequirement.trim(),

      // ✅ FIXED — ALWAYS CLEAN ARRAY
      auditQuestions: toCleanArray(form.auditQuestions),

      // ✅ FIXED — ALWAYS CLEAN ARRAY
      department: toCleanArray(form.department)
    };

    await axios.post(API_URL, payload);

    alert("Gap created successfully ✅");

    // 🔧 FIXED ROUTE (you use /gap everywhere)
    navigate("/gap/list");

  } catch (err) {
    console.error("Create Error:", err);
    alert("Failed to create gap ❌");
  } finally {
    setLoading(false);
  }
};

  const auditQuestions = form.auditQuestions
    .split(",")
    .filter(q => q.trim())
    .map(q => q.trim());

  const departments = form.department
    .split(",")
    .filter(d => d.trim())
    .map(d => d.trim());

  return (
    <MotionBox 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ 
        p: 4, 
        maxWidth: 900, 
        margin: "auto",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <MotionPaper 
        component={StyledPaper}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 20,
          delay: 0.1
        }}
        whileHover={{
          boxShadow: "0 12px 48px rgba(0, 0, 0, 0.12)",
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        }}
        elevation={0} 
        sx={{ width: "100%" }}
      >
        <HeaderSection
          component={motion.div}
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: "#1e293b",
              mb: 1,
              letterSpacing: "-0.5px"
            }}
          >
            Create Gap Question
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: "#64748b",
              fontWeight: 400
            }}
          >
            Add a new compliance gap assessment to track and monitor requirements
          </Typography>
        </HeaderSection>

        <motion.form 
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            <MotionGrid item xs={12} variants={itemVariants}>
              <StyledTextField
                fullWidth
                label="Clause/ Control Number"
                name="clause"
                value={form.clause}
                onChange={handleChange}
                required
                placeholder="e.g., 5.1.2"
                helperText="Enter the specific clause identifier"
              />
            </MotionGrid>

            <MotionGrid item xs={12} variants={itemVariants}>
              <StyledTextField
                fullWidth
                multiline
                rows={4}
                label="Standard Requirement"
                name="standardRequirement"
                value={form.standardRequirement}
                onChange={handleChange}
                required
                placeholder="Describe the compliance requirement in detail..."
                helperText="Provide the full text of the standard requirement"
              />
            </MotionGrid>

            <MotionGrid item xs={12} variants={itemVariants}>
              <StyledTextField
                fullWidth
                multiline
                rows={4}
                label="Audit Questions"
                name="auditQuestions"
                value={form.auditQuestions}
                onChange={handleChange}
                placeholder="Is policy documented?, Is it approved?, Is it communicated?"
                helperText="Enter questions separated by commas"
              />
              <AnimatePresence mode="popLayout">
                {auditQuestions.length > 0 && (
                  <Stack 
                    component={motion.div}
                    direction="row" 
                    spacing={1} 
                    sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: 1, 
                      height: "auto",
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }
                    }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {auditQuestions.map((q, idx) => (
                      <MotionChip 
                        key={`${q}-${idx}`}
                        label={q} 
                        size="small"
                        sx={{ 
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                          fontWeight: 500
                        }}
                        variants={chipVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ 
                          scale: 1.05,
                          backgroundColor: "#bfdbfe",
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                          }
                        }}
                        whileTap={{ scale: 0x95 }}
                      />
                    ))}
                  </Stack>
                )}
              </AnimatePresence>
            </MotionGrid>

            <MotionGrid item xs={12} variants={itemVariants}>
              <StyledTextField
                fullWidth
                label="Departments"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="IT, HR, Finance, Operations"
                helperText="Enter department names separated by commas"
              />
              <AnimatePresence mode="popLayout">
                {departments.length > 0 && (
                  <Stack 
                    component={motion.div}
                    direction="row" 
                    spacing={1} 
                    sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: 1, 
                      height: "auto",
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }
                    }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {departments.map((dept, idx) => (
                      <MotionChip 
                        key={`${dept}-${idx}`}
                        label={dept} 
                        size="small"
                        sx={{ 
                          backgroundColor: "#f0fdf4",
                          color: "#166534",
                          fontWeight: 500
                        }}
                        variants={chipVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ 
                          scale: 1.05,
                          backgroundColor: "#dcfce7",
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                          }
                        }}
                        whileTap={{ scale: 0.95 }}
                      />
                    ))}
                  </Stack>
                )}
              </AnimatePresence>
            </MotionGrid>

            <MotionGrid item xs={12} sx={{ mt: 2 }} variants={itemVariants}>
              <motion.div
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <StyledButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  component={motion.button}
                >
                  {loading ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CircularProgress size={24} color="inherit" />
                    </motion.div>
                  ) : (
                    "Create Gap Question"
                  )}
                </StyledButton>
              </motion.div>
            </MotionGrid>
          </Grid>
        </motion.form>
      </MotionPaper>
    </MotionBox>
  );
}

export default AddGap;