export const registrationForm = {
  title: "User Registration",
  submitLabel: "Register",
  fields: [
    {
      type: "text",
      label: "Full Name",
      name: "fullName",
      placeholder: "Enter your name",
      defaultValue: "",
      uiCompoent: "CommonInput",
      validation: {
        required: true,
        minLength: 3,
      },
    },
    {
      type: "email",
      label: "Email Address",
      name: "email",
      placeholder: "Enter your email",
      defaultValue: "",
      uiCompoent: "CommonInput",
      validation: {
        required: true,
        pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
      },
    },
    {
      type: "password",
      label: "Password",
      name: "password",
      uiCompoent: "CommonInput",
      defaultValue: "",
      validation: {
        required: true,
        minLength: 6,
      },
    },
    {
      type: "select",
      label: "Country",
      name: "country",
      uiCompoent: "Dropdown",
      placeholder: "Please select country",
      options: [
        { label: "India", value: "IN" },
        { label: "USA", value: "US" },
        { label: "Germany", value: "DE" },
      ],
      validation: {
        required: true,
      },
    },
    {
      type: "checkbox",
      label: "Accept Terms & Conditions",
      name: "termsAccepted",
      defaultValue: false,
      uiCompoent: "CommonInput",
      validation: {
        required: true,
      },
    },
  ],
};
