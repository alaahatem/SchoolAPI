const {
  validationError,
  conflictError,
  notFoundError,
  nonAuthorizedError,
} = require("../errorHandlers");
const _ = require("lodash");

const {roles, hasScope} = require("../_common/utils");
const ClassRoomModel = require("./classroom.mongoModel");
const SchoolModel = require("../school/school.mongoModel");
const StudentModel = require("../student/student.mongoModel");
const {
  isAllowedAdminCreate,
  isAllowedAdminUpdate,
} = require("../classroom/classroom.helper");
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
    this.name = "classroom";
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
  async getAll({ __longToken }) {
    const { role } = __longToken;

    //check if the user has valid class scopes
    if (!hasScope(this.scopes,role, "get")) {
      return nonAuthorizedError("Insufficient permissions");
    }

    return await ClassRoomModel.find({});
  }

  async getByID({ __longToken, params: { id } }) {
    const { role } = __longToken;

    //check if the user has valid class scopes
    if (!hasScope(this.scopes,role, "get")) {
      return nonAuthorizedError("Insufficient permissions");
    }
    const errors = await this.validators.classroom.getByID({ id });

    if (errors) {
      const messages = errors.map((error) => error.message);
      return validationError(messages);
    }

    return (await ClassRoomModel.findById(id)) || notFoundError(this.name);
  }
  async create({ __longToken, name, schoolID }) {
    try {
      const { userId, role } = __longToken;
      if (!hasScope(this.scopes,role, "create")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      //check if this is admin then check if they have access
      if (
        role !== roles.SUPER_ADMIN &&
        !(await isAllowedAdminCreate(userId, schoolID))
      ) {
        return nonAuthorizedError(
          "This admin doesn't have access to this school"
        );
      }

      const errors = await this.validators.classroom.create({ name, schoolID });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return validationError(messages);
      }
      const existingSchool = await SchoolModel.findById(schoolID);

      const existingClassroom = await ClassRoomModel.findOne({
        name,
        school: schoolID,
      });
      if (existingClassroom) {
        return conflictError(this.name);
      }

      //TODO: add this in a transaction with a rollback to ensure integrity
      return await ClassRoomModel.create({
        name,
        school: schoolID,
      });
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  async update({ __longToken, name, params: { id } }) {
    try {
      const { userId, role } = __longToken;
      if (
        role !== roles.SUPER_ADMIN &&
        !(await isAllowedAdminUpdate(userId, id))
      ) {
        return nonAuthorizedError(
          "This admin doesn't have access to this school"
        );
      }
      //check if the user has valid class scopes
      if (!hasScope(this.scopes,role, "update")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      const errors = await this.validators.classroom.update({ id, name });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return validationError(messages);
      }
      const classroom = await ClassRoomModel.findById(id);
      if (!classroom) {
        return notFoundError(this.name);
      }

      return ClassRoomModel.updateOne({ _id: id }, { $set: { name } });
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  async delete({ __longToken, params: { id } }) {
    try {
      const {userId, role } = __longToken;
      if (
        role !== roles.SUPER_ADMIN &&
        !(await isAllowedAdminUpdate(userId, id))
      ) {
        return nonAuthorizedError(
          "This admin doesn't have access to this school"
        );
      }
      //check if the user has valid class scopes
      if (!hasScope(this.scopes,role, "delete")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      const errors = await this.validators.classroom.delete({ id });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return validationError(messages);
      }

      const relatedStudents = await StudentModel.find({ classroom: id });
      console.log(relatedStudents);
      if (!_.isEmpty(relatedStudents)) {
        return conflictError(
          "Cannot delete school because dependent students exist"
        );
      }

      return ClassRoomModel.findByIdAndDelete(id);
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

}

module.exports = Classroom;
