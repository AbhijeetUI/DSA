import { useState } from "react";
import { registrationForm } from "../config/formConfig";
import CommonInput from "./formComponents/CommonInput";
import Dropdown from "./formComponents/Dropdown";
import Checkbox from "./formComponents/Checkbox";
import "../styles/Form.css";

const ConfigDrivenForm = () => {
  const { title, fields, submitLabel } = registrationForm;

  const [fieldValue, setFieldValue] = useState({
    fullName: "",
    email: "",
    password: "",
    isTnCAccept: false,
  });

  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setFieldValue((prev) => ({
      ...prev,
      // Logic: if it's a checkbox, store the 'checked' boolean, else store 'value'
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let formErrors = {};
    fields.forEach((field) => {
      const value = fieldValue[field.name] || "";
      const rules = field.validation;
      if (!rules) return;
      const regEx = new RegExp(rules.pattern);
      if (rules.required && !value) {
        formErrors[field.name] = rules.message || "This field is required";
      } else if (rules.pattern && !regEx.test(value)) {
        formErrors[field.name] = rules.message || "Invalid format";
      }
    });

    Object.keys(formErrors).length > 0 ? setErrors(formErrors) : setErrors({});
  };

  const componentMap = {
    CommonInput,
    Dropdown,
    Checkbox,
  };

  return (
    <div className="formWrapper">
      <h3>{title}</h3>
      <form onSubmit={handleFormSubmit}>
        {fields.map((field) => {
          const { name, uiCompoent, type, ...rest } = field;
          const ComponentToRender = componentMap[uiCompoent];

          if (!ComponentToRender) return null;

          return (
            <div key={name}>
              <ComponentToRender
                {...rest}
                name={name}
                type={type}
                value={fieldValue[name] ?? (type === "checkbox" ? false : "")}
                onChange={handleChange}
                error={errors[name]}
                className={name}
              />
            </div>
          );
        })}
        <button type="submit">{submitLabel}</button>
      </form>
    </div>
  );
};

export default ConfigDrivenForm;
