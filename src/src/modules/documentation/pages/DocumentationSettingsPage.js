import React, { useState } from 'react';

const DocumentationSettingsPage = () => {
  const [settings, setSettings] = useState({
    autoGenerateSoA: true,
    includeReviewNotes: false,
    defaultReportFormat: 'PDF'
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('✅ Settings saved (mock only, no backend yet)');
  };

  const pageStyle = {
    marginTop: '60px',
    padding: '20px',
    maxWidth: '800px',
    margin: '60px auto 0'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e9ecef'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '15px',
    color: '#2c3e50',
    fontWeight: 'bold'
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{color: '#2c3e50'}}>⚙️ Documentation Settings</h1>
        <p style={{color: '#7f8c8d'}}>Configure how documentation behaves.</p>

        <form onSubmit={handleSave} style={{ marginTop: '20px' }}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              name="autoGenerateSoA"
              checked={settings.autoGenerateSoA}
              onChange={handleChange}
              style={{ marginRight: '10px' }}
            />
            Auto-generate SoA
          </label>

          <label style={labelStyle}>
            <input
              type="checkbox"
              name="includeReviewNotes"
              checked={settings.includeReviewNotes}
              onChange={handleChange}
              style={{ marginRight: '10px' }}
            />
            Include Review Notes in Reports
          </label>

          <label style={labelStyle}>
            Default Report Format:
            <select
              name="defaultReportFormat"
              value={settings.defaultReportFormat}
              onChange={handleChange}
              style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
            >
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
              <option value="Word">Word</option>
            </select>
          </label>

          <button type="submit" style={{ marginTop: '20px', padding: '10px 15px', border: 'none', borderRadius: '6px', background: '#e67e22', color: 'white', cursor: 'pointer' }}>
            💾 Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default DocumentationSettingsPage;
