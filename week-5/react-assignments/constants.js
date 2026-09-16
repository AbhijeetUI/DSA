const VALIDATORS = {
  required: (msg) => ({ required: msg }),
  email: {
    required: "Email is required",
    pattern: { value: /^\S+@\S+$/, message: "Invalid email address" },
  },
  minLength: (len, msg) => ({ minLength: { value: len, message: msg } }),
};

const FORM_CONFIG = {
  steps: [
    {
      id: 1,
      title: "Personal info",
      fields: [
        {
          name: "name",
          label: "Full Name",
          placeholder: "Enter name",
          type: "text",
          validation: VALIDATORS.required("Name is required"),
        },
        {
          name: "email",
          label: "Email",
          placeholder: "Enter email",
          type: "email",
          validation: {
            required: "Email is required",
            pattern: VALIDATORS.email,
          },
        },
      ],
    },
    {
      id: 2,
      title: "Address Details",
      fields: [
        {
          name: "address",
          label: "Street Address",
          type: "text",
          placeholder: "Enter name",
          validation: VALIDATORS.required("Address is required"),
        },
        {
          name: "country",
          label: "Country",
          placeholder: "Select",
          type: "select",
          options: [
            { label: "India", value: "IN" },
            { label: "United States", value: "US" },
          ],
          validation: VALIDATORS.required("Country is required"),
        },
      ],
    },
    {
      id: 3,
      title: "Preferences",
      fields: [
        {
          name: "notifications",
          label: "Enable Notifications",
          type: "checkbox",
        },
      ],
    },
  ],
};

export default FORM_CONFIG;
