import React, { useReducer } from "react";

const initialState = {
  step: 0,
  data: {
    firstName: "",
    email: "",
    age: "",
    occupation: "",
    bio: "",
    agree: false,
  },
  errors: {},
  isSubmitted: false,
};

const TOTAL_STEPS = 3;

function validateStep(step, data) {
  const errors = {};
  if (step === 0) {
    if (!data.firstName.trim()) errors.firstName = "First name is required";
    if (!data.email.trim()) errors.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email))
      errors.email = "Invalid email";
  }
  if (step === 1) {
    if (!data.age.toString().trim()) errors.age = "Age is required";
    else if (!Number.isFinite(Number(data.age)) || Number(data.age) <= 0)
      errors.age = "Invalid age";
    if (!data.occupation.trim()) errors.occupation = "Occupation is required";
  }
  if (step === 2) {
    if (!data.bio.trim()) errors.bio = "Bio is required";
    if (!data.agree) errors.agree = "You must agree to continue";
  }
  return errors;
}

function validateAll(data) {
  const errors = {};
  for (let step = 0; step < TOTAL_STEPS; step++) {
    Object.assign(errors, validateStep(step, data));
  }
  return errors;
}

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD": {
      const { field, value } = action.payload;
      const newData = { ...state.data, [field]: value };
      const newErrors = { ...state.errors };
      if (newErrors[field]) delete newErrors[field];
      return { ...state, data: newData, errors: newErrors };
    }
    case "NEXT": {
      const errors = validateStep(state.step, state.data);
      if (Object.keys(errors).length > 0) {
        return { ...state, errors };
      }
      return {
        ...state,
        step: Math.min(state.step + 1, TOTAL_STEPS - 1),
        errors: {},
      };
    }
    case "PREV":
      return { ...state, step: Math.max(state.step - 1, 0), errors: {} };
    case "SET_ERRORS":
      return { ...state, errors: action.payload.errors };
    case "SUBMIT": {
      const errors = validateAll(state.data);
      if (Object.keys(errors).length > 0) return { ...state, errors };
      return { ...state, errors: {}, isSubmitted: true };
    }
    default:
      return state;
  }
}

export default function MuiltiStepForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: "UPDATE_FIELD",
      payload: { field: name, value: type === "checkbox" ? checked : value },
    });
  };

  const next = () => dispatch({ type: "NEXT" });
  const prev = () => dispatch({ type: "PREV" });
  const submit = () => dispatch({ type: "SUBMIT" });

  if (state.isSubmitted) {
    return (
      <div style={{ maxWidth: 600, margin: "20px auto" }}>
        <h2>Submission Successful</h2>
        <pre>{JSON.stringify(state.data, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "20px auto",
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 6,
      }}
    >
      <h2>Multi-step Form</h2>
      <div style={{ marginBottom: 12 }}>
        <strong>
          Step {state.step + 1} of {TOTAL_STEPS}
        </strong>
      </div>

      {state.step === 0 && (
        <div>
          <label>
            First name
            <input
              name="firstName"
              value={state.data.firstName}
              onChange={handleChange}
            />
          </label>
          {state.errors.firstName && (
            <div style={{ color: "red" }}>{state.errors.firstName}</div>
          )}

          <label style={{ display: "block", marginTop: 8 }}>
            Email
            <input
              name="email"
              value={state.data.email}
              onChange={handleChange}
            />
          </label>
          {state.errors.email && (
            <div style={{ color: "red" }}>{state.errors.email}</div>
          )}
        </div>
      )}

      {state.step === 1 && (
        <div>
          <label>
            Age
            <input name="age" value={state.data.age} onChange={handleChange} />
          </label>
          {state.errors.age && (
            <div style={{ color: "red" }}>{state.errors.age}</div>
          )}

          <label style={{ display: "block", marginTop: 8 }}>
            Occupation
            <input
              name="occupation"
              value={state.data.occupation}
              onChange={handleChange}
            />
          </label>
          {state.errors.occupation && (
            <div style={{ color: "red" }}>{state.errors.occupation}</div>
          )}
        </div>
      )}

      {state.step === 2 && (
        <div>
          <label>
            Bio
            <textarea
              name="bio"
              value={state.data.bio}
              onChange={handleChange}
            />
          </label>
          {state.errors.bio && (
            <div style={{ color: "red" }}>{state.errors.bio}</div>
          )}

          <label style={{ display: "block", marginTop: 8 }}>
            <input
              type="checkbox"
              name="agree"
              checked={state.data.agree}
              onChange={handleChange}
            />{" "}
            I agree
          </label>
          {state.errors.agree && (
            <div style={{ color: "red" }}>{state.errors.agree}</div>
          )}
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={prev} disabled={state.step === 0}>
          Previous
        </button>
        {state.step < TOTAL_STEPS - 1 && <button onClick={next}>Next</button>}
        {state.step === TOTAL_STEPS - 1 && (
          <button onClick={submit}>Submit</button>
        )}
      </div>
    </div>
  );
}
