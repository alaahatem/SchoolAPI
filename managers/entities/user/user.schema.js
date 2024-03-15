module.exports = {
  createUser: [
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
  loginUser: [{}],
};
