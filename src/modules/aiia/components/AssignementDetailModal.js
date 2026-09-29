import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, AlertCircle, CheckCircle,
  ChevronDown, ChevronUp, Brain, Shield, Building2,
  Calendar, User, Target, AlertTriangle, FileText,
  CheckSquare, Clock, BarChart3, PartyPopper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { stage1Api, stage2Api } from '../services/aiiaApi';
import { useUser } from '../../../hooks/useUser';
import riskService from '../../riskAssesment/services/riskService';

// ─── Stage 2 Checklist ────────────────────────────────────────────────────────
const CHECKLIST = [
  {
    key: 'technicalSecurityConsiderations',
    label: 'Technical & Security',
    letter: 'A',
    color: '#3b82f6',
    bg: '#eff6ff',
    items: [
      'System architecture and data flow documented',
      'Security measures implemented',
      'Input validation and error handling in place',
      'Access controls and authentication reviewed',
      'Vulnerability assessment completed',
    ]
  },
  {
    key: 'ethicalLegalRegulatoryConsiderations',
    label: 'Ethical & Legal',
    letter: 'B',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    items: [
      'Legal compliance reviewed',
      'Data privacy considerations addressed',
      'Regulatory requirements met',
      'Bias and fairness evaluation completed',
      'Consent and data usage policies defined',
    ]
  },
  {
    key: 'societalBusinessImpactConsiderations',
    label: 'Societal & Business Impact',
    letter: 'C',
    color: '#10b981',
    bg: '#ecfdf5',
    items: [
      'Business impact assessed',
      'Societal implications identified',
      'Stakeholder impact evaluated',
      'Potential for misuse analyzed',
    ]
  },
  {
    key: 'transparencyExplainabilityConsiderations',
    label: 'Transparency & Explainability',
    letter: 'D',
    color: '#f59e0b',
    bg: '#fffbeb',
    items: [
      'Model transparency documented',
      'Decision explainability assessed',
      'User communication plan established',
    ]
  },
  {
    key: 'dataGovernanceConsiderations',
    label: 'Data Governance',
    letter: 'E',
    color: '#06b6d4',
    bg: '#ecfeff',
    items: [
      'Data quality assessment completed',
      'Data lineage documented',
      'Data retention policy defined',
      'Data access controls verified',
    ]
  },
  {
    key: 'riskManagementConsiderations',
    label: 'Risk Management',
    letter: 'G',
    color: '#ef4444',
    bg: '#fef2f2',
    items: [
      'Risk identification completed',
      'Mitigation strategies defined',
      'Monitoring plan established',
      'Incident response plan documented',
    ]
  },
  {
    key: 'environmentalSustainabilityConsiderations',
    label: 'Environmental Sustainability',
    letter: 'H',
    color: '#84cc16',
    bg: '#f7fee7',
    items: [
      'Resource consumption evaluated',
      'Environmental impact assessed',
      'Sustainability measures considered',
    ]
  }
];

async function generateRiskId(organization) {
  const currentYear = new Date().getFullYear();
  try {
    const allRisks = await riskService.getAllRisks();
    const userOrgId = organization?._id || organization;
    const orgRiskIds = allRisks
      .filter((risk) => {
        const riskOrgId = risk.organization?._id || risk.organization;
        return String(riskOrgId) === String(userOrgId);
      })
      .map((risk) => risk.riskId);
    let nextNumber = 1;
    let newRiskId = '';
    do {
      const paddedNumber = nextNumber.toString().padStart(3, '0');
      newRiskId = `RR-${currentYear}-${paddedNumber}`;
      nextNumber++;
    } while (orgRiskIds.includes(newRiskId));
    return newRiskId;
  } catch {
    return `RR-${currentYear}-${String(Date.now()).slice(-3)}`;
  }
}

async function buildRiskPayload(item, catLabel, user, assessmentId) {
  const org = user?.organization;
  const riskId = await generateRiskId(org);
  const today = new Date().toISOString().split('T')[0];
  const riskLevel = item.status === 'No' ? 'High' : 'Medium';
  return {
    riskId,
    organization: org?._id || org || '',
    department: user?.department ?? user?.departments?.[0]?.name ?? '',
    date: today,
    riskType: ['Artificial Intelligence'],
    assetType: '',
    asset: '',
    location: '',
    riskDescription: `Risk of managing AI/AI systems due to potential misuse, failure, or compromise of AI/AI systems because of lack of ${item.consideration}.`,
    additionalControls: item.details || '',
    existingControls: '',
    controlReference: [],
    status: 'Open',
    riskLevel,
    numberOfDays: '',
    deadlineDate: '',
    additionalNotes: [
      `AI Assessment: ${assessmentId}`,
      `Section: ${catLabel}`,
      `Checklist Item: ${item.consideration}`,
      `Answer: ${item.status}`,
      item.details ? `Notes: ${item.details}` : null,
    ].filter(Boolean).join('\n'),
  };
}

// ─── Status badge helper ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  SUBMITTED:   { bg: '#dbeafe', color: '#1d4ed8', label: 'Submitted' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#b45309', label: 'In Progress' },
  DRAFT:       { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
  APPROVED:    { bg: '#d1fae5', color: '#065f46', label: 'Approved' },
  REJECTED:    { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
};

// ─── Main Page Component ──────────────────────────────────────────────────────
function AssignmentDetailPage({ assignment, onBack, onSaved }) {
  const user = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [stage2Id, setStage2Id] = useState(null);
  const [isCompleted, setIsCompleted] = useState(
    assignment.status === 'SUBMITTED' || assignment.status === 'APPROVED'
  );
  const [checklist, setChecklist] = useState(() => {
    const initial = {};
    CHECKLIST.forEach(cat => {
      initial[cat.key] = cat.items.map(text => ({
        consideration: text,
        status: '',
        details: ''
      }));
    });
    return initial;
  });
  const [expandedCats, setExpandedCats] = useState({ [CHECKLIST[0].key]: true });

  const assessmentId = assignment._id || assignment.id;

  useEffect(() => {
    loadStage2();
  }, [assessmentId]);

  const loadStage2 = async () => {
    try {
      const resp = await stage2Api.getByStage1(assessmentId);
      const data = resp.data.data;
      if (data) {
        const record = Array.isArray(data) ? data[0] : data;
        if (!record) return;
        setStage2Id(record._id || record.id);
        const merged = {};
        CHECKLIST.forEach(cat => {
          const saved = record[cat.key] || [];
          merged[cat.key] = cat.items.map((text, i) => ({
            consideration: text,
            status: saved[i]?.status || '',
            details: saved[i]?.details || ''
          }));
        });
        setChecklist(merged);
      }
    } catch {
      // No existing Stage 2 yet
    }
  };

  const updateItem = (catKey, idx, field, value) => {
    setChecklist(prev => ({
      ...prev,
      [catKey]: prev[catKey].map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    }));
  };

  const toggleCat = (key) => {
    setExpandedCats(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getProgress = () => {
    const all = Object.values(checklist).flat();
    const answered = all.filter(i => i.status !== '').length;
    return { answered, total: all.length, pct: Math.round((answered / all.length) * 100) };
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { answered, total } = getProgress();
      const allAnswered = answered === total;
      const payload = {
        stage1Id: assessmentId,
        assessmentType: 'FULL',
        status: allAnswered ? 'COMPLETED' : 'IN_PROGRESS',
        answeredCount: answered,
        totalQuestionsCount: total,
        completionPercentage: Math.round((answered / total) * 100),
        ...checklist
      };
      if (stage2Id) {
        await stage2Api.update(stage2Id, payload);
      } else {
        const resp = await stage2Api.create(payload);
        setStage2Id(resp.data.data?._id || resp.data.data?.id);
      }

      // ── If 100% answered, mark stage1 as SUBMITTED ──
      if (allAnswered) {
        try {
          await stage1Api.update(assessmentId, { status: 'SUBMITTED' });
          setIsCompleted(true);
        } catch (s1Err) {
          console.error('Failed to update stage1 status:', s1Err);
        }
      }

      let created = 0;
      for (const cat of CHECKLIST) {
        const items = checklist[cat.key] || [];
        for (const item of items) {
          if (item.status === 'No' || item.status === 'Partial') {
            try {
              const riskPayload = await buildRiskPayload(item, cat.label, user, assessmentId);
              await riskService.saveRisk(riskPayload);
              created++;
            } catch (riskErr) {
              console.error('Failed to create risk for:', item.consideration, riskErr);
            }
          }
        }
      }
      setSuccess(
        allAnswered
          ? `Assessment marked as Completed!${created > 0 ? ` ${created} risk${created !== 1 ? 's' : ''} added to the risk register.` : ''}`
          : created > 0
            ? `Checklist saved! ${created} risk${created !== 1 ? 's' : ''} automatically added to the risk register.`
            : 'Checklist saved successfully!'
      );
      if (onSaved) onSaved();
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const { answered, total, pct } = getProgress();
  const allAnswered = answered === total && total > 0;
  const noPartialCount = Object.values(checklist).flat().filter(i => i.status === 'No' || i.status === 'Partial').length;
  const statusStyle = isCompleted
    ? { bg: '#d1fae5', color: '#065f46', label: 'Completed' }
    : STATUS_STYLES[assignment.status] || STATUS_STYLES['DRAFT'];

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  // ── Mini stat cards for the header ───────────────────────────────────────
  const headerStats = [
    { icon: CheckSquare, label: 'Answered', value: `${answered}/${total}`, color: '#3b82f6' },
    { icon: BarChart3, label: 'Progress', value: `${pct}%`, color: pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#6366f1' },
    { icon: AlertTriangle, label: 'Risks Flagged', value: noPartialCount, color: noPartialCount > 0 ? '#ef4444' : '#10b981' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 50%, #faf5ff 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Sticky Top Bar ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>

            {/* Back button */}
            <motion.button
              onClick={handleBack}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: 'white', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: '#475569',
                transition: 'all 0.15s',
              }}
            >
              <ArrowLeft size={15} /> Back
            </motion.button>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
              <span>AIIA</span>
              <span>›</span>
              <span>My Assignments</span>
              <span>›</span>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>{assignment.aiSystemName}</span>
            </div>

            <div style={{ flex: 1 }} />

            {/* Status badge */}
            <span style={{
              padding: '5px 14px', borderRadius: 999,
              background: statusStyle.bg, color: statusStyle.color,
              fontSize: 12, fontWeight: 700, letterSpacing: '0.03em',
            }}>
              {statusStyle.label}
            </span>

            {/* Save button — always visible in topbar when on checklist tab */}
            {activeTab === 'stage2' && (
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 20px', borderRadius: 10,
                  background: isCompleted
                    ? '#10b981'
                    : saving ? '#94a3b8' : allAnswered
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white', border: 'none',
                  cursor: (saving || isCompleted) ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 700,
                  boxShadow: (saving || isCompleted) ? 'none' : allAnswered
                    ? '0 4px 12px rgba(16,185,129,0.35)'
                    : '0 4px 12px rgba(99,102,241,0.35)',
                  opacity: isCompleted ? 0.75 : 1,
                }}
              >
                {isCompleted ? <CheckCircle size={15} /> : <Save size={15} />}
                {isCompleted ? 'Completed' : saving ? 'Saving…' : allAnswered ? 'Mark as Complete' : 'Save Checklist'}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* ── Page Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            borderRadius: 20,
            padding: '32px 36px',
            marginBottom: 28,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: '40%',
            width: 150, height: 150,
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.2)',
                flexShrink: 0,
              }}>
                <Brain size={26} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  margin: 0, fontSize: 26, fontWeight: 700,
                  color: 'white', lineHeight: 1.2, marginBottom: 6,
                }}>
                  {assignment.aiSystemName}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Building2 size={13} /> {assignment.department}
                  </span>
                  {assignment.aiSystemOwner && (
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <User size={13} /> {assignment.aiSystemOwner}
                    </span>
                  )}
                  {assignment.dateOfAssessment && (
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={13} /> {new Date(assignment.dateOfAssessment).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mini stat row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {headerStats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 18px',
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: 12,
                    }}
                  >
                    <Icon size={16} color={s.color} />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{s.label}</div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Progress bar inline */}
              <div style={{
                flex: 1, minWidth: 200,
                padding: '10px 18px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 12,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>Checklist Completion</span>
                  <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: 99,
                      background: pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#6366f1',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Feedback banners ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
                padding: '12px 18px', borderRadius: 12,
                background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                fontSize: 14, fontWeight: 600,
              }}
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
                padding: '12px 18px', borderRadius: 12,
                background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
                fontSize: 14, fontWeight: 600,
              }}
            >
              <CheckCircle size={16} /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Completion Banner ── */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                marginBottom: 20, padding: '18px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '1.5px solid #86efac',
                boxShadow: '0 4px 16px rgba(16,185,129,0.12)',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PartyPopper size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#065f46', marginBottom: 2 }}>
                  Assessment Completed!
                </div>
                <div style={{ fontSize: 13, color: '#16a34a' }}>
                  All checklist items have been answered and this assessment has been marked as <strong>Submitted</strong> for review.
                </div>
              </div>
              <span style={{
                padding: '6px 16px', borderRadius: 999,
                background: '#10b981', color: 'white',
                fontSize: 12, fontWeight: 700,
              }}>
                100% Complete
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tab Navigation ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex', gap: 4,
            background: 'white',
            borderRadius: 14,
            padding: 6,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: 24,
            width: 'fit-content',
          }}
        >
          {[
            { key: 'info', label: 'Overview', icon: FileText },
            { key: 'stage2', label: `Stage 2 Checklist`, icon: CheckSquare, badge: `${pct}%` },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 10, border: 'none',
                  background: active ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                  color: active ? 'white' : '#64748b',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: active ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                <Icon size={15} />
                {tab.label}
                {tab.badge && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                    background: active ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                    color: active ? 'white' : '#6366f1',
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: 20,
              }}>
                {/* System Details Card */}
                <div style={{
                  background: 'white', borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Brain size={15} color="white" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>System Details</h3>
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    <InfoField label="AI System Name" value={assignment.aiSystemName} icon={Brain} />
                    <InfoField label="Department" value={assignment.department} icon={Building2} />
                    <InfoField label="System Owner" value={assignment.aiSystemOwner} icon={User} />
                    <InfoField label="Assessment Date" value={
                      assignment.dateOfAssessment
                        ? new Date(assignment.dateOfAssessment).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : null
                    } icon={Calendar} last />
                  </div>
                </div>

                {/* Objectives Card */}
                <div style={{
                  background: 'white', borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Target size={15} color="white" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Objectives & Use</h3>
                  </div>
                  <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <TextBlock label="Business Objective" value={assignment.businessObjective} />
                    <TextBlock label="Intended Use" value={assignment.intendedUse} />
                    {assignment.foreseableMisuse && (
                      <TextBlock label="Foreseeable Misuse" value={assignment.foreseableMisuse} warn />
                    )}
                  </div>
                </div>

                {/* Info notice — full width */}
                <div style={{
                  gridColumn: '1 / -1',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '18px 22px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 14,
                }}>
                  <AlertCircle size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 14, color: '#1d4ed8', lineHeight: 1.6 }}>
                    <strong>How risk creation works:</strong> When you save the checklist, any item answered{' '}
                    <strong>No</strong> or <strong>Partial</strong> will automatically be added to the risk register
                    with risk type <strong>Artificial Intelligence</strong>.
                    Items marked <strong>No</strong> create <strong>High</strong> severity risks;
                    items marked <strong>Partial</strong> create <strong>Medium</strong> severity risks.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stage2' && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Legend strip */}
              <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap',
                marginBottom: 20,
                padding: '12px 18px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginRight: 4 }}>Legend:</span>
                {[
                  { label: 'Yes — Compliant', bg: '#d1fae5', color: '#065f46' },
                  { label: 'No → Risk (High)', bg: '#fee2e2', color: '#dc2626' },
                  { label: 'Partial → Risk (Medium)', bg: '#fef3c7', color: '#b45309' },
                  { label: 'N/A — Skip', bg: '#f1f5f9', color: '#475569' },
                ].map((l, i) => (
                  <span key={i} style={{
                    padding: '4px 12px', borderRadius: 99,
                    background: l.bg, color: l.color,
                    fontSize: 12, fontWeight: 600,
                  }}>{l.label}</span>
                ))}
              </div>

              {/* Checklist categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {CHECKLIST.map((cat, catIdx) => {
                  const isOpen = expandedCats[cat.key];
                  const catItems = checklist[cat.key] || [];
                  const catAnswered = catItems.filter(i => i.status).length;
                  const catRisks = catItems.filter(i => i.status === 'No' || i.status === 'Partial').length;
                  const catPct = Math.round((catAnswered / catItems.length) * 100);

                  return (
                    <motion.div
                      key={cat.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.05 }}
                      style={{
                        background: 'white',
                        border: `1px solid ${isOpen ? cat.color + '40' : '#e2e8f0'}`,
                        borderRadius: 16,
                        overflow: 'hidden',
                        boxShadow: isOpen ? `0 4px 20px ${cat.color}18` : '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {/* Category header */}
                      <button
                        onClick={() => toggleCat(cat.key)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                          padding: '16px 22px', border: 'none', cursor: 'pointer',
                          background: isOpen ? cat.bg : 'white',
                          transition: 'background 0.2s',
                          textAlign: 'left',
                        }}
                      >
                        {/* Letter badge */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: cat.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, color: 'white',
                          flexShrink: 0,
                        }}>
                          {cat.letter}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{cat.label}</span>
                            <span style={{
                              fontSize: 12, fontWeight: 600,
                              color: catAnswered === catItems.length ? '#10b981' : '#64748b',
                              padding: '2px 10px', borderRadius: 99,
                              background: catAnswered === catItems.length ? '#d1fae5' : '#f1f5f9',
                            }}>
                              {catAnswered}/{catItems.length}
                            </span>
                            {catRisks > 0 && (
                              <span style={{
                                fontSize: 12, fontWeight: 700,
                                color: '#dc2626', padding: '2px 10px', borderRadius: 99,
                                background: '#fee2e2',
                              }}>
                                ⚠ {catRisks} risk{catRisks !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {/* Mini progress bar */}
                          <div style={{ height: 4, background: '#e2e8f0', borderRadius: 99, width: 180 }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              width: `${catPct}%`,
                              background: cat.color,
                              transition: 'width 0.4s ease',
                            }} />
                          </div>
                        </div>

                        <div style={{ color: '#94a3b8', flexShrink: 0 }}>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {/* Items */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '8px 22px 20px' }}>
                              {catItems.map((item, idx) => {
                                const isRisk = item.status === 'No' || item.status === 'Partial';
                                return (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    style={{
                                      marginBottom: idx < catItems.length - 1 ? 12 : 0,
                                      padding: '14px 18px',
                                      borderRadius: 12,
                                      border: `1px solid ${isRisk ? '#fecaca' : item.status === 'Yes' ? '#bbf7d0' : '#f1f5f9'}`,
                                      background: isRisk ? '#fff5f5' : item.status === 'Yes' ? '#f0fdf4' : '#fafafa',
                                      transition: 'all 0.2s',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                      {/* Q number */}
                                      <span style={{
                                        fontSize: 11, fontWeight: 800, color: cat.color,
                                        background: cat.bg,
                                        padding: '3px 8px', borderRadius: 6,
                                        flexShrink: 0, marginTop: 1,
                                      }}>
                                        Q{idx + 1}
                                      </span>

                                      {/* Question text */}
                                      <span style={{
                                        flex: 1, fontSize: 14, fontWeight: 500,
                                        color: '#1e293b', lineHeight: 1.5,
                                      }}>
                                        {item.consideration}
                                      </span>

                                      {/* Status select */}
                                      <select
                                        value={item.status}
                                        onChange={e => updateItem(cat.key, idx, 'status', e.target.value)}
                                        style={{
                                          flexShrink: 0,
                                          padding: '6px 12px',
                                          borderRadius: 8,
                                          border: `1.5px solid ${
                                            item.status === 'Yes' ? '#10b981' :
                                            item.status === 'No' ? '#ef4444' :
                                            item.status === 'Partial' ? '#f59e0b' :
                                            '#cbd5e1'
                                          }`,
                                          background: 'white',
                                          fontSize: 13, fontWeight: 600,
                                          color: item.status === 'Yes' ? '#10b981' :
                                                 item.status === 'No' ? '#ef4444' :
                                                 item.status === 'Partial' ? '#d97706' : '#64748b',
                                          cursor: 'pointer',
                                          outline: 'none',
                                        }}
                                      >
                                        <option value="">Select…</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                        <option value="Partial">Partial</option>
                                        <option value="N/A">N/A</option>
                                      </select>
                                    </div>

                                    {/* Risk warning */}
                                    {isRisk && (
                                      <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        marginTop: 10, marginLeft: 44,
                                        fontSize: 12, fontWeight: 600,
                                        color: item.status === 'No' ? '#dc2626' : '#b45309',
                                      }}>
                                        <AlertTriangle size={13} />
                                        Will create a {item.status === 'No' ? 'High' : 'Medium'} risk on save
                                      </div>
                                    )}

                                    {/* Notes textarea */}
                                    <div style={{ marginTop: 10, marginLeft: 44 }}>
                                      <textarea
                                        value={item.details}
                                        onChange={e => updateItem(cat.key, idx, 'details', e.target.value)}
                                        placeholder={
                                          isRisk
                                            ? 'Describe the gap (saved as risk notes)…'
                                            : 'Add notes or evidence…'
                                        }
                                        rows={2}
                                        style={{
                                          width: '100%', boxSizing: 'border-box',
                                          padding: '10px 14px',
                                          borderRadius: 8,
                                          border: '1.5px solid #e2e8f0',
                                          background: 'white',
                                          fontSize: 13, color: '#475569',
                                          resize: 'vertical',
                                          fontFamily: 'inherit',
                                          outline: 'none',
                                          transition: 'border-color 0.15s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = cat.color}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                      />
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom save bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  position: 'sticky', bottom: 20,
                  marginTop: 24,
                  padding: '16px 24px',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 16, flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {answered}/{total} items answered
                  </div>
                  {noPartialCount > 0 && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 13, fontWeight: 600, color: '#dc2626',
                      padding: '4px 12px', borderRadius: 99,
                      background: '#fee2e2',
                    }}>
                      <AlertTriangle size={13} />
                      {noPartialCount} item{noPartialCount !== 1 ? 's' : ''} will create risks
                    </span>
                  )}
                </div>
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px', borderRadius: 12,
                    background: saving ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: 'white', border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: 14, fontWeight: 700,
                    boxShadow: saving ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Saving…' : 'Save Checklist'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────────
function InfoField({ label, value, icon: Icon, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      paddingBottom: last ? 0 : 14,
      marginBottom: last ? 0 : 14,
      borderBottom: last ? 'none' : '1px solid #f1f5f9',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: '#f8fafc', border: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={14} color="#64748b" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: value ? '#1e293b' : '#cbd5e1' }}>
          {value || '—'}
        </div>
      </div>
    </div>
  );
}

function TextBlock({ label, value, warn }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: warn ? '#b45309' : '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {warn && <AlertTriangle size={12} />}
        {label}
      </div>
      <div style={{
        fontSize: 14, color: value ? '#475569' : '#cbd5e1',
        lineHeight: 1.6,
        padding: '12px 14px',
        background: warn ? '#fffbeb' : '#f8fafc',
        borderRadius: 10,
        border: `1px solid ${warn ? '#fde68a' : '#f1f5f9'}`,
      }}>
        {value || '—'}
      </div>
    </div>
  );
}

export default AssignmentDetailPage;
