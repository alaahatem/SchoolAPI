

class School {
  constructor({
    utils,
    errorHandlers,
    config,
    validators,
    mongomodels,
  } = {}) {
    this.errorHandlers = errorHandlers
    this.utils = utils
    this.config = config;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.name = "school";
    this.utils = utils
    this.httpExposed = [
      "create",
      "put=update",
      "delete=delete",
      "get=getByID",
      "get=getAll",
    ];
    this.scopes = {
      get: [this.utils.roles.SUPER_ADMIN],
      create: [this.utils.roles.SUPER_ADMIN],
      update: [this.utils.roles.SUPER_ADMIN],
      delete: [this.utils.roles.SUPER_ADMIN],
      getAll: [this.utils.roles.SUPER_ADMIN],
    };
  }
  async getByID({ __longToken, params: { id } }) {
    console.log(this.errorHandlers)
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "get")) {
        return this.errorHandlers.nonAuthorizedError("Insufficient permissions");
      }
      const errors = await this.validators.school.getByID({ id });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }

      return (await this.mongomodels.school.findById(id)) || this.errorHandlers.notFoundError(this.name);
    } catch (err) {
      console.error(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }

  async getAll({ __longToken }) {
    console.log(this.c)
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "get")) {
        return this.errorHandlers.nonAuthorizedError("Insufficient permissions");
      }

      return await this.mongomodels.school.find({});
    } catch (err) {
      console.error(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }

  async create({ __longToken, name, address }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "create")) {
        return this.errorHandlers.nonAuthorizedError("Insufficient permissions");
      }
      const errors = await this.validators.school.create({ name, address });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }

      const school = await this.mongomodels.school.findOne({ name });
      if (school) {
        return this.errorHandlers.conflictError(this.name);
      }
      return this.mongomodels.school.create({ name, address });
    } catch (err) {
      console.error(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }

  async update({ __longToken, name, address, params: { id } }) {
    try {
      console.log(this.tokenManager)
      const { role } = __longToken;
      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "update")) {
        return this.errorHandlers.nonAuthorizedError("Insufficient permissions");
      }
      const errors = await this.validators.school.update({ id, name, address });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }

      const school = await this.mongomodels.school.findById(id);
      if (!school) {
        return this.errorHandlers.notFoundError(this.name);
      }

      return this.mongomodels.school.updateOne({ _id: id }, { $set: { name, address } });
    } catch (err) {
      console.error(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }

  async delete({ __longToken, params: { id } }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "delete")) {
        return this.errorHandlers.nonAuthorizedError("Insufficient permissions");
      }
      const errors = await this.validators.school.delete({ id });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }
      // the return await here is for one liner conclusion for operands evaluation to complete
      const relatedClassrooms = this.mongomodels.classroom.find({ school: id });
      if (!this.utils.isEmpty(relatedClassrooms)) {
        return this.errorHandlers.conflictError(
          this.name,
          "Cannot delete school because dependent classrooms exist"
        );
      }
      const relatedUsers = this.mongomodels.user.find({ school: id });
      if (!this.utils.isEmpty(relatedUsers)) {
        return this.errorHandlers.conflictError(
          this.name,
          "Cannot delete school because dependent users exist"
        );
      }

      return this.mongomodels.school.findByIdAndDelete(id);
    } catch (err) {
      console.log(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }
}

module.exports = School;
