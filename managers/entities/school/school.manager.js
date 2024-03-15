const {
  validationError,
  conflictError,
  notFoundError,
  nonAuthorizedError,
} = require("../errorHandlers");
const roles = require("../_common/utils");
const SchoolModel = require("./school.mongoModel");
const { query } = require("express");
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
    this.usersCollection = "school";
    this.httpExposed = [
      "create",
      "put=update",
      "delete=delete",
      "get=getByID",
      "get=getAll",
    ];
    this.scopes = {
      get: [roles.SUPER_ADMIN],
      create: [roles.SUPER_ADMIN],
      update: [roles.SUPER_ADMIN],
      delete: [roles.SUPER_ADMIN],
      getAll: [roles.SUPER_ADMIN],
    };
  }
  async getByID({ __longToken, id }) {
    const { role } = __longToken;

    //check if the user has valid class scopes
    if (!this.hasScope(role, "get")) {
      return nonAuthorizedError("Insufficient permissions");
    }
    const validationIssue = await this.validators.school.getByID({
      id,
    });
    if (validationIssue) {
      // return first emitted error
      return validationError(validationIssue[0]?.message);
    }

    return (
      (await SchoolModel.findById(id)) || notFoundError("This id doesnt exist")
    );
  }

  async getAll({ __longToken, id }) {
    const { role } = __longToken;

    //check if the user has valid class scopes
    if (!this.hasScope(role, "get")) {
      return nonAuthorizedError("Insufficient permissions");
    }

    return await SchoolModel.find({});
  }

  async create({ __longToken, name, address }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.hasScope(role, "create")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      const validationIssue = await this.validators.school.create({
        name,
        address,
      });
      if (validationIssue) {
        // return first emitted error
        return validationError(validationIssue[0]?.message);
      }

      const school = await SchoolModel.findOne({ name });
      if (school) {
        return conflictError("A school with this name already exists ");
      }
      return SchoolModel.create({ name, address });
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  async update({ __longToken, id, name, address }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.hasScope(role, "update")) {
        return nonAuthorizedError("Insufficient permissions");
      }
      const validationIssue = await this.validators.school.update({
        id,
        name,
        address,
      });

      if (validationIssue) {
        // return first emitted error

        return validationError(validationIssue[0]?.message);
      }
      const school = await SchoolModel.findById(id);
      if (!school) {
        return notFoundError("This id doesn't exists");
      }

      return SchoolModel.updateOne({ _id: id }, { $set: { name, address } });
    } catch (err) {
      console.log(err);
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
      const validationIssue = await this.validators.school.delete({ id });

      if (validationIssue) {
        return validationError(validationIssue[0]?.message);
      }
      // the return await here is for one liner conclusion for operands evaluation to complete
      return (
        (await SchoolModel.findByIdAndDelete(id)) ||
        notFoundError("This id doesn't exist")
      );
    } catch (err) {
      console.log(err);
      throw new Error("Internal server error");
    }
  }

  hasScope(role, functionName) {
    return this.scopes[functionName].includes(role);
  }
}

module.exports = School;
