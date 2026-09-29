import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { risksApi } from '../services/aiiaApi';
import '../styles/shared.css';

function RisksList() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [error, setError] = useState(null);

  const categories = ['TECHNICAL', 'SECURITY', 'ETHICAL', 'LEGAL', 'OPERATIONAL', 'REPUTATIONAL'];

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const response = await risksApi.getAll();
      setRisks(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching risks:', err);
      setError('Failed to load risks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this risk?')) return;
    
    try {
      await risksApi.delete(id);
      setRisks(risks.filter(r => r._id !== id));
    } catch (err) {
      console.error('Error deleting risk:', err);
      setError('Failed to delete risk');
    }
  };

  const filtered = risks.filter(r => {
    const matchesSearch = r.riskDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || r.riskCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getSeverityColor = (likelihood, impact) => {
    const scoreMap = {
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1
    };
    const score = (scoreMap[likelihood] || 0) * (scoreMap[impact] || 0);
    if (score >= 6) return '#dc2626';
    if (score >= 3) return '#f59e0b';
    return '#10b981';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'TECHNICAL': '#3b82f6',
      'SECURITY': '#dc2626',
      'ETHICAL': '#8b5cf6',
      'LEGAL': '#f59e0b',
      'OPERATIONAL': '#06b6d4',
      'REPUTATIONAL': '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Risk Management</h1>
          <p>Identify, assess and manage risks</p>
        </div>
        <Link href="/aiia/risks/new" className="btn btn-primary">
          <Plus size={18} />
          Add Risk
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filters-bar">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search risks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="category-filter"
        >
          <option value="ALL">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={48} style={{ color: '#d1d5db' }} />
          <p>No risks found. Create one to get started.</p>
        </div>
      ) : (
        <div className="risks-grid">
          {filtered.map(risk => (
            <div key={risk._id} className="risk-card">
              <div className="risk-header">
                <div className="risk-title">
                  <h3>{risk.riskDescription}</h3>
                  <span 
                    className="category-badge" 
                    style={{ backgroundColor: getCategoryColor(risk.riskCategory) }}
                  >
                    {risk.riskCategory}
                  </span>
                </div>
                <div 
                  className="severity-indicator"
                  style={{ backgroundColor: getSeverityColor(risk.likelihood, risk.impact) }}
                >
                  {risk.riskScore || 'N/A'}
                </div>
              </div>

              <div className="risk-body">
                <div className="risk-metrics">
                  <div className="metric">
                    <span className="metric-label">Likelihood</span>
                    <span className={`metric-value likelihood-${risk.likelihood?.toLowerCase()}`}>
                      {risk.likelihood}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Impact</span>
                    <span className={`metric-value impact-${risk.impact?.toLowerCase()}`}>
                      {risk.impact}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Score</span>
                    <span className="metric-value">{risk.riskScore || 0}</span>
                  </div>
                </div>

                <div className="risk-details">
                  <div className="detail-item">
                    <span className="label">Owner:</span>
                    <span className="value">{risk.ownerName || 'Unassigned'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge status-${risk.mitigationStatus?.toLowerCase().replace(/_/g, '-')}`}>
                      {risk.mitigationStatus}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Due Date:</span>
                    <span className="value">
                      {risk.dueDate ? new Date(risk.dueDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                </div>

                {risk.mitigationStrategy && (
                  <div className="mitigation-section">
                    <p className="label">Mitigation Strategy:</p>
                    <p className="mitigation-text">{risk.mitigationStrategy}</p>
                  </div>
                )}
              </div>

              <div className="risk-footer">
                <Link href={`/aiia/risks/edit/${risk._id}`} className="btn-icon" title="Edit">
                  <Edit size={18} />
                </Link>
                <button 
                  onClick={() => handleDelete(risk._id)} 
                  className="btn-icon btn-danger" 
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RisksList;
