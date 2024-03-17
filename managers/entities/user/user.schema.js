module.exports = {
  createSuperAdmin: [
    {
      label: "email",
      path: "email",
      model: "email",
      required: true,
    },
    {
      label: "password",
      model: "password",
      required: true,
    },
    {
      model: "text",
      path: "role",
      required: true,
    },
    {
      model: "id",
      path: "schoolID",
    },
  ],
  createAdmin: [
    {
      label: "email",
      path: "email",
      model: "email",
      required: true,
    },
    {
      label: "password",
      model: "password",
      required: true,
    },
    {
      model: "text",
      path: "role",
      required: true,
    },
    {
      model: "id",
      path: "schoolID",
      required: true,
    },
  ],
  login: [
    {
      label: "email",
      path: "email",
      model: "email",
      required: true,
    },
    {
      label: "password",
      model: "password",
      required: true,
    },
  ],
};
