const {
  validationError,
  conflictError,
  notFoundError,
  nonAuthorizedError,
} = require("../errorHandlers");
const _ = require("lodash");

const {roles, hasScope} = require("../_common/utils");
const StudentModel = require("./student.mongoModel");
const ClassRoomModel = require("../classroom/classroom.mongoModel");
const UserModel = require("../user/user.mongoModel");
const { isAllowedAdmin } = require("./student.helper");
class School {
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
    this.name = "student";
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
  async getByID({ __longToken, params: { id } }) {
    const { role } = __longToken;

    //check if the user has valid class scopes
    if (!hasScope(this.scopes,role, "get")) {
      return nonAuthorizedError("Insufficient permissions");
    }
    const errors = await this.validators.student.getByID({ id });

    if (errors) {
      const messages = errors.map((error) => error.message);
      return validationError(messages);
    }

    return (await StudentModel.findById(id)) || notFoundError(this.name);
  }

  async getAll({ __longToken, classroomID }) {
    const { role } = __longToken;

    //check if the user has valid class scopes
    if (!hasScope(this.scopes,role, "get")) {
        return nonAuthorizedError("Insufficient permissions");
      }

    return await StudentModel.find(classroomID ? { classroom: classroomID } : {});
  }

  async create({ __longToken, name, age, classroomID }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!hasScope(this.scopes,role, "create")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      const errors = await this.validators.student.create({
        name,
        age,
        classroomID,
      });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return validationError(messages);
      }

      const existingClassroom = ClassRoomModel.findById(classroomID);
      if (!existingClassroom) {
        notFoundError("Classroom");
      }
      return StudentModel.create({ name, age, classroom: classroomID });
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  async update({ __longToken, name, age, classroomID, params: { id } }) {
    try {
      const { userId, role } = __longToken;

      //check if the user has valid class scopes
      if (!hasScope(this.scopes,role, "update")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      //check if this is admin then check if they have access
      if (role !== roles.SUPER_ADMIN && !(await isAllowedAdmin(userId, id))) {
        return nonAuthorizedError(
          "This admin doesn't have access to this student"
        );
      }

      const errors = await this.validators.student.update({
        id,
        name,
        age,
        classroomID,
      });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return validationError(messages);
      }

      return (
        (await StudentModel.findByIdAndUpdate(
          id,
          { name, age, classroom: classroomID },
          { new: true }
        )) || notFoundError(this.name)
      );
    } catch (err) {
      console.log(err);
      throw new Error("Internal server error");
    }
  }

  async delete({ __longToken, params: { id } }) {
    try {
      const { userId, role } = __longToken;

    //check if the user has valid class scopes
    if (!hasScope(this.scopes,role, "delete")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      //check if this is admin then check if they have access
      if (role !== roles.SUPER_ADMIN && !(await isAllowedAdmin(userId, id))) {
        return nonAuthorizedError(
          "This admin doesn't have access to this student"
        );
      }
      const errors = await this.validators.student.delete({ id });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return validationError(messages);
      }
      // the return await here is for one liner conclusion for operands evaluation to complete

      return (
        (await StudentModel.findByIdAndDelete(id)) || notFoundError(this.name)
      );
    } catch (err) {
      console.log(err);
      throw new Error("Internal server error");
    }
  }


}

module.exports = School;
