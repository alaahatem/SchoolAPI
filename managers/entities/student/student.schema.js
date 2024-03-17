module.exports = {
  create: [
    {
      model: "longText",
      path: "name",
      required: true,
    },
    {
      model: "number",
      path: "age",
      required: true,
    },
    {
      path: "classroomID",
      model: "id",
      required: true,
    },
  ],

  update: [
    {
      path: "id",
      model: "id",
      required: true,
    },
    {
      model: "text",
      path: "name",
    },
    {
      path: "age",
      model: "number",
    },
    {
      path: "classroomID",
      model: "id",
    },
  ],

  delete: [
    {
      label: "id",
      path: "id",
      model: "id",
      required: true,
    },
  ],

  getByID: [
    {
      label: "id",
      path: "id",
      model: "id",
      required: true,
    },
  ],
  getAll: [],
};
