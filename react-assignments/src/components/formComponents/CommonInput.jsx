const CommonInput = ({
  name,
  type,
  label,
  value,
  onChange,
  placeholder,
  className,
  error,
}) => {
  return (
    <div className={`${className}-wrapper`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  );
};

export default CommonInput;
