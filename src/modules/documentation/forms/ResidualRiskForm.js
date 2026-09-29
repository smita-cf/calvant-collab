import React, { useEffect } from 'react';
import InputField from '../inputs/InputField';

const ResidualRiskForm = ({ formData = {}, handleInputChange }) => {
  useEffect(() => {
    // always reset to top when component loads
    window.scrollTo(0, 0);
  }, []);
  // Calculate deadline date dynamically with null checks
  const calculateDeadlineDate = () => {
    if (formData.date && formData.numberOfDays) {
      const startDate = new Date(formData.date);
      const days = parseInt(formData.numberOfDays) || 0;
      if (days > 0) {
        const deadlineDate = new Date(startDate);
        deadlineDate.setDate(startDate.getDate() + days);
        return deadlineDate.toISOString().split('T')[0];
      }
    }
    return '';
  };

  // Update deadline whenever numberOfDays changes
  useEffect(() => {
    const deadline = calculateDeadlineDate();
    if (deadline && deadline !== formData.deadlineDate) {
      const event = {
        target: {
          name: 'deadlineDate',
          value: deadline
        }
      };
      handleInputChange(event);
    }
  }, [formData.numberOfDays, formData.date, formData.deadlineDate, handleInputChange]);

  const summaryCardStyle = {
    background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
    color: 'white',
    padding: '20px 30px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 8px 25px rgba(155, 89, 182, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  };

  const summaryItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  };

  const summaryLabelStyle = {
    fontSize: '12px',
    opacity: '0.9',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const summaryValueStyle = {
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  };

  const formStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    maxWidth: '900px',
    margin: '0 auto',
    border: '1px solid #e9ecef'
  };

  // Format date for display with null checks
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Not Set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div style={formStyle}>
      {/* Summary Header Card */}
      <div style={summaryCardStyle}>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Risk ID</span>
          <span style={summaryValueStyle}>{formData.riskId || 'Not Set'}</span>
        </div>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Department</span>
          <span style={summaryValueStyle}>{formData.department || 'Not Set'}</span>
        </div>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Risk Type</span>
          <span style={summaryValueStyle}>{formData.riskType || 'Not Set'}</span>
        </div>
      </div>

      <div style={{textAlign: 'center', marginBottom: '35px', paddingBottom: '20px', borderBottom: '3px solid #9b59b6'}}>
        <h2 style={{color: '#2c3e50', fontSize: '28px', fontWeight: '700', marginBottom: '8px'}}>
          📊 Residual Risk & Task Assignment
        </h2>
        <p style={{color: '#7f8c8d', fontSize: '16px'}}>Finalize task scheduling and assignment details</p>
      </div>

      <div style={{
        background: 'rgba(155, 89, 182, 0.05)',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid rgba(155, 89, 182, 0.1)',
        marginBottom: '25px'
      }}>
        <h3 style={{
          color: '#2c3e50',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px'
        }}>
          📅 Task Scheduling
        </h3>
        <p style={{color: '#7f8c8d', marginBottom: '25px', fontSize: '14px'}}>
          Set the timeline for task assignment and completion based on the risk assessment date
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '25px',
          marginBottom: '25px'
        }}>
          {/* Start Date (Read-only from Step 1) */}
          <InputField
            label="Start Date (From Risk Assessment)"
            name="startDateDisplay"
            value={formData.date || ''}
            onChange={() => {}} // Read-only
            readOnly={true}
            type="date"
          />

          {/* Number of Days Input */}
          <InputField
            label="Task Assignment After (Days)"
            name="numberOfDays"
            value={formData.numberOfDays || ''}
            onChange={handleInputChange}
            placeholder="Enter number of days (e.g., 3, 5, 7)"
            type="number"
            min="1"
            max="365"
            required
          />
        </div>

        {/* Calculated Deadline Date Display */}
        {formData.numberOfDays && formData.date && (
          <div style={{
            background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(26, 188, 156, 0.3)'
          }}>
            <div style={{
              fontSize: '14px',
              opacity: '0.9',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              📅 Calculated Task Deadline
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>
              {formatDateForDisplay(calculateDeadlineDate())}
            </div>
            <div style={{
              fontSize: '12px',
              opacity: '0.8',
              marginTop: '8px'
            }}>
              {formData.numberOfDays} day{parseInt(formData.numberOfDays || '0') !== 1 ? 's' : ''} from start date
            </div>
          </div>
        )}
      </div>

      {/* Summary of Assessment */}
      {formData.riskId && formData.numberOfDays && (
        <div style={{
          background: 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '25px',
          textAlign: 'center'
        }}>
          <h4 style={{color: '#2c3e50', marginBottom: '10px'}}>Assessment Summary</h4>
          <p style={{color: '#5d6d7e', fontSize: '14px'}}>
            Risk <strong>{formData.riskId}</strong> from <strong>{formData.department}</strong> department 
            will have tasks assigned <strong>{formData.numberOfDays} day{parseInt(formData.numberOfDays || '0') !== 1 ? 's' : ''}</strong> after 
            the assessment date ({formatDateForDisplay(formData.date)}).
          </p>
        </div>
      )}
    </div>
  );
};

export default ResidualRiskForm;
