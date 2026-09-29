import React from 'react';

const SelectField = ({ 
  label, 
  value, 
  onChange, 
  name, 
  options = [], 
  placeholder = 'Select an option',
  required = false,
  className = '',
  readOnly=false,
  ...props 
}) => {
  const containerStyle = {
    marginBottom: '20px',
    width: '100%'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '8px',
    fontSize: '14px',
    letterSpacing: '0.5px'
  };

  const selectStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e1e8ed',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer'
  };

  const selectFocusStyle = {
    borderColor: '#3498db',
    boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)',
    backgroundColor: '#ffffff'
  };

  const requiredStyle = {
    color: '#e74c3c',
    marginLeft: '4px',
    fontSize: '16px'
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label htmlFor={name} style={labelStyle}>
          {label}
          {required && <span style={requiredStyle}>*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={selectStyle}
        disabled={readOnly}
        onFocus={(e) => Object.assign(e.target.style, selectFocusStyle)}
        onBlur={(e) => Object.assign(e.target.style, selectStyle)}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
