import { useReducer } from "react";
import FORM_CONFIG from "../constants";

const { steps } = FORM_CONFIG;

const initialState = {
  currentStep: 1,
  formData: {},
  errors: {},
  isSubmitted: false,
};

const getPatternRule = (validation) => {
  if (!validation || !validation.pattern) return null;

  return validation.pattern.pattern || validation.pattern;
};

const validateField = (field, value) => {
  const errors = [];

  if (field.type === "checkbox") return errors;

  if (!value) {
    errors.push(field.validation.required);
  }

  return errors;
};

const validateStep = (fields, formData) => {
  const stepErrors = {};

  for (const field of fields) {
    const fieldErrors = validateField(field, formData[field.name]);

    if (fieldErrors.length > 0) {
      stepErrors[field.name] = fieldErrors;
    }
  }

  return stepErrors;
};

function reducer(state, action) {
  const currentFields = steps[state.currentStep - 1]?.fields || [];
  switch (action.type) {
    case "UPDATE_FIELD": {
      const { name, value, type, checked } = action.payload;

      return {
        ...state,
        formData: {
          ...state.formData,
          [name]: type === "checkbox" ? checked : value,
        },
        errors: {
          ...state.errors,
          [name]: undefined,
        },
      };
    }

    case "NEXT_STEP": {
      const stepErrors = validateStep(currentFields, state.formData);

      if (Object.keys(stepErrors).length > 0) {
        return {
          ...state,
          errors: stepErrors,
        };
      }

      return {
        ...state,
        currentStep: state.currentStep + 1,
        errors: {},
      };
    }

    case "PREVIOUS_STEP": {
      return {
        ...state,
        currentStep: state.currentStep - 1,
        errors: {},
      };
    }

    case "SUBMIT": {
      const stepErrors = validateStep(currentFields, state.formData);

      if (Object.keys(stepErrors).length > 0) {
        return {
          ...state,
          errors: stepErrors,
        };
      }

      return {
        ...state,
        isSubmitted: true,
        errors: {},
      };
    }

    default:
      return state;
  }
}

function MultiStepForm() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { currentStep, formData, errors, isSubmitted } = state;

  const currentStepData = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;

    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        name,
        value,
        type,
        checked,
      },
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      dispatch({ type: "SUBMIT" });
      return;
    }

    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div>
      <h2>Multi Step Form</h2>

      {isSubmitted ? (
        <div>
          <h3>Form submitted successfully!</h3>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      ) : (
        <>
          <div>
            Step {currentStep} of {steps.length}
          </div>

          <h3>{currentStepData.title}</h3>

          {currentStepData.fields.map((field) => {
            const hasError = Boolean(errors[field.name]?.length);
            if (field.type === "select") {
              return (
                <div key={field.name} style={{ marginBottom: "16px" }}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <br />
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {hasError && (
                    <div style={{ color: "red", marginTop: "4px" }}>
                      {errors[field.name][0]}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={field.name} style={{ marginBottom: "16px" }}>
                <label htmlFor={field.name}>{field.label}</label>
                <br />
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={
                    field.type === "checkbox"
                      ? undefined
                      : formData[field.name] || ""
                  }
                  checked={
                    field.type === "checkbox"
                      ? Boolean(formData[field.name])
                      : undefined
                  }
                  placeholder={field.placeholder}
                  onChange={handleChange}
                />
                {hasError && (
                  <div style={{ color: "red", marginTop: "4px" }}>
                    {errors[field.name][0]}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => dispatch({ type: "PREVIOUS_STEP" })}
              disabled={currentStep === 1}
            >
              Previous
            </button>

            <button type="button" onClick={handleNext}>
              {isLastStep ? "Submit" : "Next"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MultiStepForm;
