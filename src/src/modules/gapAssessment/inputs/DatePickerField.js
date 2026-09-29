import React from 'react';
import '../../styles/GlobalStyles.css';

const DatePickerField = ({ 
  label, 
  value, 
  onChange, 
  name, 
  required = false,
  className = '',
  readOnly = false,
  ...props 
}) => {
  return (
    <div className={`date-picker-container ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type="date"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="date-picker-field"
        disabled={readOnly}
        {...props}
      />
    </div>
  );
};

export default DatePickerField;
