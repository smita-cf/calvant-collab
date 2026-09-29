import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ProgressCircle } from 'lucide-react';
import { stage2Api } from '../services/aiiaApi';
import '../styles/shared.css';

function Stage2List() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await stage2Api.getAll();
      setAssessments(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    
    try {
      await stage2Api.delete(id);
      setAssessments(assessments.filter(a => a._id !== id));
    } catch (err) {
      console.error('Error deleting assessment:', err);
      setError('Failed to delete assessment');
    }
  };

  const filtered = assessments.filter(a =>
    a._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': '#f59e0b',
      'IN_PROGRESS': '#3b82f6',
      'COMPLETED': '#10b981',
      'SUBMITTED': '#8b5cf6',
      'APPROVED': '#06b6d4'
    };
    return colors[status] || '#6b7280';
  };

  const getCompletionColor = (completion) => {
    if (completion >= 80) return '#10b981';
    if (completion >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Stage 2 - Impact Assessment</h1>
          <p>Detailed impact and risk assessments</p>
        </div>
        <Link href="/aiia/stage2/new" className="btn btn-primary">
          <Plus size={18} />
          New Assessment
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search assessments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No assessments found. Create one to get started.</p>
        </div>
      ) : (
        <div className="assessments-grid">
          {filtered.map(assessment => (
            <div key={assessment._id} className="assessment-card">
              <div className="card-header">
                <div className="card-title">{assessment._id.substring(0, 20)}...</div>
                <span 
                  className="badge" 
                  style={{ backgroundColor: getStatusColor(assessment.status) }}
                >
                  {assessment.status}
                </span>
              </div>

              <div className="card-body">
                <div className="stat-item">
                  <span className="label">Assessment Type:</span>
                  <span className="value">{assessment.assessmentType || 'FULL'}</span>
                </div>

                <div className="stat-item">
                  <span className="label">Progress:</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${assessment.completionPercentage || 0}%`,
                        backgroundColor: getCompletionColor(assessment.completionPercentage)
                      }}
                    />
                  </div>
                  <span className="value">{assessment.completionPercentage || 0}%</span>
                </div>

                <div className="stat-item">
                  <span className="label">Questions:</span>
                  <span className="value">
                    {assessment.answeredCount || 0} / {assessment.totalQuestionsCount || 0}
                  </span>
                </div>

                <div className="stat-item">
                  <span className="label">Created:</span>
                  <span className="value">{new Date(assessment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-footer">
                <Link href={`/aiia/stage2/edit/${assessment._id}`} className="btn-icon" title="Edit">
                  <Edit size={18} />
                </Link>
                <button 
                  onClick={() => handleDelete(assessment._id)} 
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

export default Stage2List;
