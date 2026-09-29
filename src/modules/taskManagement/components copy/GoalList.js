import React from 'react';
import '../styles/GlobalStyles.css';

const GoalList = ({ goals = [] }) => {
  return (
    <div className="goal-list-container">
      <div className="goal-list-header">
        <h3>Saved Risk Assessments</h3>
      </div>
      
      {goals.length === 0 ? (
        <div className="no-goals-message">
          <p>No risk assessments found. Create your first risk assessment to get started.</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal, index) => (
            <div key={index} className="goal-card">
              <div className="goal-header">
                <h4>{goal.riskId || `Risk-${index + 1}`}</h4>
                <span className={`risk-badge ${goal.riskLevel?.toLowerCase()}`}>
                  {goal.riskLevel || 'Unknown'}
                </span>
              </div>
              <div className="goal-content">
                <p><strong>Type:</strong> {goal.riskType}</p>
                <p><strong>Date:</strong> {goal.date}</p>
                <p className="goal-description">
                  {goal.riskDescription || 'No description available'}
                </p>
              </div>
              <div className="goal-actions">
                <button className="btn btn-primary">Edit</button>
                <button className="btn btn-secondary">View</button>
                <button className="btn btn-outline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalList;
