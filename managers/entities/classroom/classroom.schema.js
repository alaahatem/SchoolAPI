module.exports = {
  create: [
    {
      model: "roomName",
      path: "name",
      required: true,
    },
    {
      model: "id",
      path: "schoolID",
      required: true,
    },
    {
      model: "arrayOfStrings",
      path: "students",
    },
  ],
  update: [
    {
      label: "id",
      path: "id",
      model: "id",
      type: "Number",
      required: true,
    },
    {
      model: "roomName",
      path: "name",
      required: true,
    },
  ],
  delete: [
    {
      label: "id",
      path: "id",
      model: "id",
      type: "Number",
      required: true,
    },
  ],
  getByID: [
    {
      label: "id",
      path: "id",
      model: "id",
      type: "Number",
      required: true,
    },
  ],
  getAll: [],

};
