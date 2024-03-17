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
  ],
  update: [
    {
      label: "id",
      path: "id",
      model: "id",
      required: true,
    },
    {
      model: "roomName",
      path: "name",
    },
    {
      model: "id",
      path: "schoolID",
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
