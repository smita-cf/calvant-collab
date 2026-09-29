import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import AddTaskForm from '../components/forms/RiskDetailsForm';

const AddTask = () => {
  const history = useHistory();
  const location = useLocation();
  
  // Get risk data from navigation state (if coming from multi-step form)
  const riskData = location.state?.riskData || {};
  
  const [formData, setFormData] = useState({
    // Risk context data (read-only)
    riskId: riskData.riskId || '',
    department: riskData.department || '',
    riskType: riskData.riskType || '',
    
    // Task-specific data (to be added later)
    taskTitle: '',
    taskDescription: '',
    assignedTo: '',
    dueDate: '',
    priority: '',
    status: 'Not Started'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleNext = () => {
    // For now, just show success message
    console.log('Task Data:', formData);
    alert('📋 Task Creation - Next Step!');
    // Later this will navigate to task assignment or next step
  };

  const handlePrevious = () => {
    // Go back to risk assessment or previous page
    if (location.state?.fromRiskAssessment) {
      history.push('/risk-assessment/add-risk', { formData: riskData });
    } else {
      history.push('/risk-assessment');
    }
  };

  const handleSubmit = () => {
    console.log('Task Submitted:', formData);
    alert('🎉 Task Created Successfully!');
    history.push('/risk-assessment/task-management');
  };

  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    marginTop: '80px',
    minHeight: '70vh',
    position: 'relative'
  };

  const pageHeaderStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e9ecef',
    textAlign: 'center'
  };

  const navigationStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    display: 'flex',
    gap: '15px',
    zIndex: 100,
    flexDirection: 'row-reverse'
  };

  const buttonStyle = {
    padding: '15px 30px',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '140px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#27ae60',
    color: 'white',
    transform: 'translateY(0)'
  };

  const primaryButtonHoverStyle = {
    backgroundColor: '#229954',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(39, 174, 96, 0.3)'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'white',
    color: '#7f8c8d',
    border: '2px solid #ecf0f1'
  };

  const mobileNavigationStyle = `
    @media (max-width: 768px) {
      .fixed-navigation {
        position: fixed !important;
        bottom: 20px !important;
        left: 20px !important;
        right: 20px !important;
        flex-direction: column !important;
        gap: 10px !important;
      }
      .nav-button {
        width: 100% !important;
        min-width: auto !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileNavigationStyle}</style>
      <div style={containerStyle}>
        {/* Page Header */}
        <div style={pageHeaderStyle}>
          <h1 style={{color: '#2c3e50', marginBottom: '10px'}}>Add New Task</h1>
          <p style={{color: '#7f8c8d'}}>Create task assignments related to risk management</p>
        </div>

        {/* Task Form */}
        <div style={{marginBottom: '120px'}}>
          <AddTaskForm formData={formData} handleInputChange={handleInputChange} />
        </div>

        {/* Fixed Navigation */}
        <div style={navigationStyle} className="fixed-navigation">
          <button 
            style={secondaryButtonStyle}
            onClick={handlePrevious}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ecf0f1';
              e.target.style.color = '#2c3e50';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#7f8c8d';
            }}
            className="nav-button"
          >
            ← Previous
          </button>

          <button 
            onClick={handleNext}
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, primaryButtonHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, primaryButtonStyle);
            }}
            className="nav-button"
          >
            Next Step →
          </button>
        </div>
      </div>
    </>
  );
};

export default AddTask;
