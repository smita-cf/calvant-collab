import React, { useState } from 'react';

const ReportsPage = () => {
  const [reports, setReports] = useState([
    { id: 1, title: 'Q1 Compliance Report', date: '2025-01-10' },
    { id: 2, title: 'Audit Preparation Report', date: '2025-03-01' }
  ]);

  const [newReport, setNewReport] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newReport) return;

    setReports([...reports, { id: reports.length + 1, title: newReport, date: new Date().toISOString().slice(0, 10) }]);
    setNewReport('');
  };

  const pageStyle = {
    marginTop: '60px',
    padding: '20px',
    maxWidth: '1000px',
    margin: '60px auto 0'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e9ecef'
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{color: '#2c3e50'}}>📊 Reports</h1>
        <p style={{color: '#7f8c8d'}}>View and generate reports.</p>

        {/* Table */}
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>ID</th>
              <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>Title</th>
              <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>{report.id}</td>
                <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>{report.title}</td>
                <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>{report.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Generate New Report */}
        <form onSubmit={handleAdd} style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Report Title"
            value={newReport}
            onChange={(e) => setNewReport(e.target.value)}
            style={{ padding: '10px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '6px', width: '300px' }}
          />
          <button type="submit" style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', background: '#8e44ad', color: 'white', cursor: 'pointer' }}>
            📄 Generate Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportsPage;
