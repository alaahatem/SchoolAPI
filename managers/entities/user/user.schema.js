module.exports = {
<<<<<<< Updated upstream
    createUser: [
        {
            label: "email",
            model: "email",
            required: true,

          },
          {
            label: "password",
            model: "password",
            type: "String",
            required: true,
          },
    ],
    loginUser: [{}],
  };
=======
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
>>>>>>> Stashed changes
