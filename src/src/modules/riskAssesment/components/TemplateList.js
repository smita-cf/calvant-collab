import React from 'react';
import '../styles/GlobalStyles.css';

const TemplateList = () => {
  const templates = [
    {
      id: 1,
      name: 'Security Risk Assessment',
      description: 'Template for security-related risk assessments',
      category: 'Security'
    },
    {
      id: 2,
      name: 'Operational Risk Assessment',
      description: 'Template for operational risk assessments',
      category: 'Operations'
    },
    {
      id: 3,
      name: 'Financial Risk Assessment',
      description: 'Template for financial risk assessments',
      category: 'Finance'
    }
  ];

  return (
    <div className="template-list-container">
      <div className="templates-grid">
        {templates.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h4>{template.name}</h4>
              <span className="template-category">{template.category}</span>
            </div>
            <div className="template-content">
              <p>{template.description}</p>
            </div>
            <div className="template-actions">
              <button className="btn btn-primary">Use Template</button>
              <button className="btn btn-outline">Preview</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateList;
