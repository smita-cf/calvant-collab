import React from 'react';
import '../styles/GlobalStyles.css';

const TemplateDetail = ({ template }) => {
  return (
    <div className="template-detail-container">
      <div className="template-detail-header">
        <h2>{template?.name || 'Template Details'}</h2>
        <p>{template?.description || 'Template description'}</p>
      </div>
      
      <div className="template-detail-content">
        <p>Template details will be displayed here.</p>
      </div>
    </div>
  );
};

export default TemplateDetail;
