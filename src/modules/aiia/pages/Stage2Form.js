import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { Save, X, Check } from 'lucide-react';
import { stage2Api, stage1Api } from '../services/aiiaApi';

const CATEGORIES = {
  A: 'Technical & Security Considerations',
  B: 'Ethical & Legal Considerations',
  C: 'Societal & Business Impact',
  D: 'Transparency & Explainability',
  E: 'Data Governance',
  G: 'Risk Management',
  H: 'Environmental Sustainability'
};

function Stage2Form() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [stage1Data, setStage1Data] = useState(null);

  const [form, setForm] = useState({
    stage1Id: '',
    assessmentType: 'FULL',
    status: 'DRAFT',
    technicalSecurityConsiderations: [],
    ethicalLegalRegulatoryConsiderations: [],
    societalBusinessImpactConsiderations: [],
    transparencyExplainabilityConsiderations: [],
    dataGovernanceConsiderations: [],
    riskManagementConsiderations: [],
    environmentalSustainabilityConsiderations: []
  });

  const assessmentItems = {
    technicalSecurityConsiderations: [
      { srNo: 1, consideration: 'System architecture and data flow documented', category: 'A' },
      { srNo: 2, consideration: 'Security measures implemented', category: 'A' },
      { srNo: 3, consideration: 'Input validation and error handling', category: 'A' },
    ],
    ethicalLegalRegulatoryConsiderations: [
      { srNo: 1, consideration: 'Legal compliance reviewed', category: 'B' },
      { srNo: 2, consideration: 'Data privacy considerations', category: 'B' },
      { srNo: 3, consideration: 'Regulatory requirements met', category: 'B' },
    ],
    societalBusinessImpactConsiderations: [
      { srNo: 1, consideration: 'Business impact assessed', category: 'C' },
      { srNo: 2, consideration: 'Societal implications identified', category: 'C' },
      { srNo: 3, consideration: 'Stakeholder impact evaluated', category: 'C' },
    ],
    transparencyExplainabilityConsiderations: [
      { srNo: 1, consideration: 'Model transparency documented', category: 'D' },
      { srNo: 2, consideration: 'Decision explainability assessed', category: 'D' },
      { srNo: 3, consideration: 'User communication plan', category: 'D' },
    ],
    dataGovernanceConsiderations: [
      { srNo: 1, consideration: 'Data quality assessment', category: 'E' },
      { srNo: 2, consideration: 'Data lineage documented', category: 'E' },
      { srNo: 3, consideration: 'Data retention policy defined', category: 'E' },
    ],
    riskManagementConsiderations: [
      { srNo: 1, consideration: 'Risk identification completed', category: 'G' },
      { srNo: 2, consideration: 'Mitigation strategies defined', category: 'G' },
      { srNo: 3, consideration: 'Monitoring plan established', category: 'G' },
    ],
    environmentalSustainabilityConsiderations: [
      { srNo: 1, consideration: 'Resource consumption evaluated', category: 'H' },
      { srNo: 2, consideration: 'Environmental impact assessed', category: 'H' },
      { srNo: 3, consideration: 'Sustainability measures considered', category: 'H' },
    ]
  };

  useEffect(() => {
    if (id) fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const response = await stage2Api.getById(id);
      setForm(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError('Failed to load assessment');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        totalQuestionsCount: Object.values(form)
          .filter(v => Array.isArray(v))
          .reduce((sum, arr) => sum + arr.length, 0),
        answeredCount: Object.values(form)
          .filter(v => Array.isArray(v))
          .reduce((sum, arr) => sum + arr.filter(item => item.status).length, 0)
      };

      if (id) {
        await stage2Api.update(id, payload);
      } else {
        await stage2Api.create(payload);
      }
      router.push('/aiia/stage2');
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError(err.response?.data?.message || 'Failed to save assessment');
      setSaving(false);
    }
  };

  const updateItem = (categoryKey, itemIndex, field, value) => {
    setForm(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map((item, idx) =>
        idx === itemIndex ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id ? 'Edit Assessment' : 'New Stage 2 Assessment'}</h1>
        <Link href="/aiia/stage2" className="btn btn-secondary">
          <X size={18} />
          Cancel
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-section">
          <h2>Assessment Settings</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Stage 1 Reference ID</label>
              <input
                type="text"
                value={form.stage1Id}
                onChange={(e) => setForm(prev => ({ ...prev, stage1Id: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label>Assessment Type</label>
              <select
                value={form.assessmentType}
                onChange={(e) => setForm(prev => ({ ...prev, assessmentType: e.target.value }))}
              >
                <option value="FULL">Full Assessment</option>
                <option value="LIGHT">Light Assessment</option>
                <option value="RAPID">Rapid Assessment</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="DRAFT">Draft</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
              </select>
            </div>
          </div>
        </div>

        {Object.entries(CATEGORIES).map(([key, categoryName]) => {
          const categoryKey = Object.keys(assessmentItems).find(k => 
            k.includes(key.toLowerCase())
          ) || `category${key}`;
          const items = form[categoryKey] || assessmentItems[categoryKey] || [];

          return (
            <div key={key} className="form-section">
              <h2>{categoryName}</h2>
              
              {items.length === 0 ? (
                <div className="empty-state">
                  <p>No items in this category</p>
                </div>
              ) : (
                <div className="assessment-items">
                  {items.map((item, idx) => (
                    <div key={idx} className="assessment-item">
                      <div className="item-header">
                        <span className="item-number">Q{item.srNo}</span>
                        <span className="item-text">{item.consideration}</span>
                      </div>

                      <div className="item-controls">
                        <select
                          value={item.status || ''}
                          onChange={(e) => updateItem(categoryKey, idx, 'status', e.target.value)}
                          className="status-select"
                        >
                          <option value="">Select Status</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Partial">Partial</option>
                        </select>

                        <textarea
                          value={item.details || ''}
                          onChange={(e) => updateItem(categoryKey, idx, 'details', e.target.value)}
                          placeholder="Add details..."
                          rows="2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Assessment'}
          </button>
          <Link href="/aiia/stage2" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default Stage2Form;
