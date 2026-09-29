import React from 'react';

const InputField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  name, 
  placeholder = '', 
  required = false,
  readOnly = false,
  className = '',
  ...props 
}) => {
  const containerStyle = {
    marginBottom: '20px',
    width: '100%'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    color: readOnly ? '#7f8c8d' : '#2c3e50',
    marginBottom: '8px',
    fontSize: '14px',
    letterSpacing: '0.5px'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: readOnly ? '2px solid #ecf0f1' : '2px solid #e1e8ed',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: readOnly ? '#f8f9fa' : '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
    color: readOnly ? '#7f8c8d' : '#2c3e50',
    cursor: readOnly ? 'not-allowed' : 'text'
  };

  const inputFocusStyle = {
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
          {required && !readOnly && <span style={requiredStyle}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        style={inputStyle}
        onFocus={(e) => !readOnly && Object.assign(e.target.style, inputFocusStyle)}
        onBlur={(e) => !readOnly && Object.assign(e.target.style, inputStyle)}
        {...props}
      />
    </div>
  );
};

export default InputField;
