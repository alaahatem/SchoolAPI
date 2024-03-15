const {
  validationError,
  conflictError,
  notFoundError,
  nonAuthorizedError,
} = require("../errorHandlers");
const _ = require("lodash");

const roles = require("../_common/utils");
const ClassRoomModel = require("./classroom.mongoModel");
const SchoolModel = require("../school/school.mongoModel");
class Classroom {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.usersCollection = "classroom";
    this.httpExposed = [
      "create",
      "put=update",
      "delete=delete",
      "get=getByID",
      "get=getAll",
    ];
    this.scopes = {
      get: [roles.SUPER_ADMIN, roles.ADMIN],
      create: [roles.SUPER_ADMIN, roles.ADMIN],
      update: [roles.SUPER_ADMIN, roles.ADMIN],
      delete: [roles.SUPER_ADMIN, roles.ADMIN],
    };
  }
  async getAll({ __longToken, id }) {
    const { role } = __longToken;

    //check if the user has valid class scopes
    if (!this.hasScope(role, "get")) {
      return nonAuthorizedError("Insufficient permissions");
    }

    return await ClassRoomModel.find({});
  }

  async getByID({ __longToken, id }) {
    const { role } = __longToken;

    //check if the user has valid class scopes
    if (!this.hasScope(role, "get")) {
      return nonAuthorizedError("Insufficient permissions");
    }
    const validationIssue = await this.validators.classroom.getByID({
      id,
    });
    if (validationIssue) {
      // return first emitted error
      return validationError(validationIssue[0]?.message);
    }

    return (
      (await ClassRoomModel.findById(id)) ||
      notFoundError("This id doesnt exist")
    );
  }
  async create({ __longToken, name, schoolID, studentIDs = [] }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.hasScope(role, "create")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      const validationIssue = await this.validators.classroom.create({
        name,
        schoolID,
      });
      if (validationIssue) {
        // return first emitted error
        return validationError(validationIssue[0]?.message);
      }

      const existingSchool = await SchoolModel.findById(schoolID);
      const { classrooms: existingClassrooms } = existingSchool;
      const existingClassroom = await ClassRoomModel.findOne({
        name,
        school: schoolID,
      });
      if (existingClassroom) {
        return conflictError(
          "A classroom in this school with this name already exists "
        );
      }

      //TODO: add this in a transaction with a rollback to ensure integrity
      const classroom = await ClassRoomModel.create({
        name,
        school: schoolID,
        studentIDs,
      });
      const newClassrooms = [...existingClassrooms, classroom];
      return SchoolModel.updateOne(
        { _id: schoolID },
        { $set: { classrooms: newClassrooms } }
      );
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  async update({ __longToken, id, name }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.hasScope(role, "update")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      const validationIssue = await this.validators.classroom.update({
        id,
        name,
      });

      if (validationIssue) {
        // return first emitted error

        return validationError(validationIssue[0]?.message);
      }
      const classroom = await ClassRoomModel.findById(id);
      if (!classroom) {
        return notFoundError("This id doesn't exists");
      }

      return ClassRoomModel.updateOne({ _id: id }, { $set: { name } });
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  async delete({ __longToken, id }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.hasScope(role, "delete")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      const validationIssue = await this.validators.classroom.delete({ id });

      if (validationIssue) {
        return validationError(validationIssue[0]?.message);
      }
      // the return await here is for one liner conclusion for operands evaluation to complete
      const { school } =
        (await ClassRoomModel.findByIdAndDelete(id)) ||
        notFoundError("This id doesnt exist");
      const { classrooms } =
        (await SchoolModel.findById(school)) ||
        notFoundError("This id doesnt exist");
      const filteredList = _.filter(
        classrooms,
        (item) => item.toString() !== id
      );

      return SchoolModel.updateOne(
        { _id: school },
        { $set: { classrooms: filteredList } }
      );
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  hasScope(role, functionName) {
    return this.scopes[functionName].includes(role);
  }
}

module.exports = Classroom;
