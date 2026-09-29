import React from 'react';
import './StatCard.css';

function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">
        {icon}
      </div>
      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>
        <h3 className="stat-card-value">{value}</h3>
      </div>
    </div>
  );
}

export default StatCard;