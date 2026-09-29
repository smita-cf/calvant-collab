import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { Save, X } from 'lucide-react';
import { risksApi } from '../services/aiiaApi';

function RisksForm() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    riskDescription: '',
    riskCategory: 'TECHNICAL',
    likelihood: 'MEDIUM',
    impact: 'MEDIUM',
    mitigationStrategy: '',
    mitigationStatus: 'NOT_STARTED',
    ownerName: '',
    dueDate: '',
    evidence: ''
  });

  const categories = ['TECHNICAL', 'SECURITY', 'ETHICAL', 'LEGAL', 'OPERATIONAL', 'REPUTATIONAL'];
  const levels = ['HIGH', 'MEDIUM', 'LOW'];
  const mitigationStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

  useEffect(() => {
    if (id) fetchRisk();
  }, [id]);

  const fetchRisk = async () => {
    try {
      const response = await risksApi.getById(id);
      setForm(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching risk:', err);
      setError('Failed to load risk');
      setLoading(false);
    }
  };

  const calculateRiskScore = (likelihood, impact) => {
    const scoreMap = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    return (scoreMap[likelihood] || 0) * (scoreMap[impact] || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        riskScore: calculateRiskScore(form.likelihood, form.impact)
      };

      if (id) {
        await risksApi.update(id, payload);
      } else {
        await risksApi.create(payload);
      }
      router.push('/aiia/risks');
    } catch (err) {
      console.error('Error saving risk:', err);
      setError(err.response?.data?.message || 'Failed to save risk');
      setSaving(false);
    }
  };

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const riskScore = calculateRiskScore(form.likelihood, form.impact);
  const getSeverityColor = (score) => {
    if (score >= 6) return '#dc2626';
    if (score >= 3) return '#f59e0b';
    return '#10b981';
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id ? 'Edit Risk' : 'Add New Risk'}</h1>
        <Link href="/aiia/risks" className="btn btn-secondary">
          <X size={18} />
          Cancel
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-section">
          <h2>Risk Details</h2>

          <div className="form-group">
            <label>Risk Description *</label>
            <textarea
              required
              rows="3"
              value={form.riskDescription}
              onChange={(e) => setField('riskDescription', e.target.value)}
              placeholder="Describe the risk in detail..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                required
                value={form.riskCategory}
                onChange={(e) => setField('riskCategory', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Risk Owner</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setField('ownerName', e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Likelihood *</label>
              <select
                required
                value={form.likelihood}
                onChange={(e) => setField('likelihood', e.target.value)}
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Impact *</label>
              <select
                required
                value={form.impact}
                onChange={(e) => setField('impact', e.target.value)}
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Risk Score</label>
              <div className="risk-score-display">
                <div 
                  className="score-badge"
                  style={{ backgroundColor: getSeverityColor(riskScore) }}
                >
                  {riskScore}
                </div>
                <small>Auto-calculated from Likelihood × Impact</small>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Mitigation Strategy</h2>

          <div className="form-group">
            <label>Mitigation Strategy</label>
            <textarea
              rows="3"
              value={form.mitigationStrategy}
              onChange={(e) => setField('mitigationStrategy', e.target.value)}
              placeholder="Describe how you plan to mitigate this risk..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mitigation Status</label>
              <select
                value={form.mitigationStatus}
                onChange={(e) => setField('mitigationStatus', e.target.value)}
              >
                {mitigationStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setField('dueDate', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Evidence / Supporting Documentation</label>
            <textarea
              rows="3"
              value={form.evidence}
              onChange={(e) => setField('evidence', e.target.value)}
              placeholder="Attach evidence or supporting documents..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Risk'}
          </button>
          <Link href="/aiia/risks" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>

      <style>{`
        .risk-score-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .score-badge {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
        }

        .risk-score-display small {
          color: #6b7280;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}

export default RisksForm;
