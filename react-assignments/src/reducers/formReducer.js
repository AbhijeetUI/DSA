// Initial state
export const initialState = {
  step: 1,
  formData: {
    firstName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    zipCode: "",
  },
  errors: {},
  isSubmitted: false,
};

// Reducer function
export const formReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value,
        },
        errors: {
          ...state.errors,
          [action.payload.field]: null,
        },
      };

    case "SET_ERRORS":
      return {
        ...state,
        errors: action.payload,
      };

    case "NEXT_STEP":
      return {
        ...state,
        step: Math.min(state.step + 1, 3),
      };

    case "PREV_STEP":
      return {
        ...state,
        step: Math.max(state.step - 1, 1),
      };

    case "SUBMIT":
      return {
        ...state,
        isSubmitted: true,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
};
