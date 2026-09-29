import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { auditApi } from '../services/aiiaApi';
import '../styles/shared.css';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [error, setError] = useState(null);

  const actions = ['CREATE', 'UPDATE', 'SUBMIT', 'APPROVE', 'REJECT', 'DELETE'];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditApi.getAll();
      setLogs(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(log => {
    const matchesSearch = 
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action) => {
    const colors = {
      'CREATE': '#10b981',
      'UPDATE': '#3b82f6',
      'SUBMIT': '#8b5cf6',
      'APPROVE': '#06b6d4',
      'REJECT': '#ef4444',
      'DELETE': '#dc2626'
    };
    return colors[action] || '#6b7280';
  };

  const getEntityTypeIcon = (entityType) => {
    const icons = {
      'STAGE1': '📋',
      'STAGE2': '📊',
      'RISK': '⚠️',
      'ASSESSMENT': '🔍'
    };
    return icons[entityType] || '📄';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Audit Logs</h1>
          <p>Track all activities and changes</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary">
          <Filter size={18} />
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filters-bar">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by user, action, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="action-filter"
        >
          <option value="ALL">All Actions</option>
          {actions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No audit logs found.</p>
        </div>
      ) : (
        <div className="audit-logs-container">
          <div className="logs-timeline">
            {filtered.map((log, idx) => (
              <div key={log._id} className="log-entry">
                <div className="log-timeline-dot" style={{ backgroundColor: getActionColor(log.action) }} />
                
                <div className="log-content">
                  <div className="log-header">
                    <div className="log-action-badge" style={{ backgroundColor: getActionColor(log.action) }}>
                      {log.action}
                    </div>
                    <span className="log-entity-type">
                      {getEntityTypeIcon(log.entityType)} {log.entityType}
                    </span>
                    <span className="log-timestamp">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="log-description">{log.description}</p>

                  <div className="log-details">
                    <div className="detail-item">
                      <span className="label">User:</span>
                      <span className="value">{log.userName}</span>
                      <span className="email">({log.userEmail})</span>
                    </div>

                    {log.changesSummary && (
                      <div className="detail-item">
                        <span className="label">Changes:</span>
                        <span className="value">{log.changesSummary}</span>
                      </div>
                    )}

                    {log.ipAddress && (
                      <div className="detail-item">
                        <span className="label">IP:</span>
                        <span className="value">{log.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-bar {
          flex: 1;
          min-width: 250px;
        }

        .action-filter {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.95rem;
        }

        .audit-logs-container {
          background: white;
          border-radius: 0.5rem;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .logs-timeline {
          position: relative;
          padding-left: 2rem;
        }

        .logs-timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e5e7eb;
        }

        .log-entry {
          position: relative;
          margin-bottom: 2rem;
          display: flex;
          gap: 1rem;
        }

        .log-timeline-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          left: -7px;
          top: 6px;
          border: 3px solid white;
          box-shadow: 0 0 0 3px #f3f4f6;
        }

        .log-content {
          flex: 1;
        }

        .log-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .log-action-badge {
          display: inline-block;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .log-entity-type {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .log-timestamp {
          color: #9ca3af;
          font-size: 0.85rem;
          margin-left: auto;
        }

        .log-description {
          margin: 0.5rem 0;
          color: #374151;
          font-weight: 500;
        }

        .log-details {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f3f4f6;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item .label {
          font-weight: 600;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .detail-item .value {
          color: #374151;
          font-size: 0.95rem;
        }

        .detail-item .email {
          color: #9ca3af;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .log-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .log-timestamp {
            margin-left: 0;
          }

          .log-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default AuditLogs;