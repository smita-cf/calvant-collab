import React from 'react';

const TextAreaField = ({ 
  label, 
  value, 
  onChange, 
  name, 
  placeholder = '', 
  required = false,
  rows = 4,
  className = '',
  readOnly = false,
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

  const textareaStyle = {
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
    resize: 'vertical',
    minHeight: '100px'
  };

  const textareaFocusStyle = {
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
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={readOnly}
        rows={rows}
        style={textareaStyle}
        onFocus={(e) => Object.assign(e.target.style, textareaFocusStyle)}
        onBlur={(e) => Object.assign(e.target.style, textareaStyle)}
        {...props}
      />
    </div>
  );
};

export default TextAreaField;
