import React from "react";
import Select from "react-select";

const SelectField = ({
  label,
  value, // react-select expects an object { value, label } or an array of them
  onChange,
  name,
  options = [],
  isMulti = false, // renamed from multiple
  placeholder = "Select...",
  required = false,
  className = "",
  readOnly = false,
}) => {
  const containerStyle = { marginBottom: "20px", width: "100%" };
  const labelStyle = {
    display: "block",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
    fontSize: "14px",
  };

  // Custom styles for react-select to match your existing UI
  const customStyles = {
    control: (base) => ({
      ...base,
      padding: "6px",
      borderRadius: "8px",
      border: "2px solid #e1e8ed",
      boxShadow: "none",
      "&:hover": { borderColor: "#3498db" },
    }),
  };

  const handleSelectChange = (selectedOption) => {
    // We mimic a standard event object so your handleInputChange still works
    onChange({
      target: {
        name: name,
        value: isMulti
          ? (selectedOption || []).map((opt) => opt.value) // Use || [] to handle null
          : selectedOption
            ? selectedOption.value
            : "", // Return single string
      },
    });
  };

  // Convert your simple string values back into objects for react-select to display correctly
  const getValue = () => {
    if (isMulti) {
      return options.filter((opt) => (value || []).includes(opt.value));
    }
    return options.find((opt) => opt.value === value) || null;
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label style={labelStyle}>
          {label} {required && <span style={{ color: "#e74c3c" }}>*</span>}
        </label>
      )}
      <Select
        name={name}
        isMulti={isMulti}
        options={options}
        value={getValue()}
        onChange={handleSelectChange}
        placeholder={placeholder}
        isDisabled={readOnly}
        styles={customStyles}
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default SelectField;
