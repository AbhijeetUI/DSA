const Dropdown = ({
  name,
  label,
  value,
  onChange,
  placeholder,
  options = [],
  error,
}) => {
  return (
    <div className="dropdown-wrapper">
      {/* Label linked to the select via htmlFor */}
      <label htmlFor={name} className="form-label">
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={error ? "input-error" : "input-field"}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Validation Message */}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Dropdown;
