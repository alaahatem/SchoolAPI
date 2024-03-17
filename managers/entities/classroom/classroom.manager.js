class Classroom {
  constructor({
    utils,
    errorHandlers,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config;
    this.utils = utils;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.errorHandlers = errorHandlers;
    this.name = "classroom";
    this.httpExposed = [
      "create",
      "put=update",
      "delete=delete",
      "get=getByID",
      "get=getAll",
    ];
    this.scopes = {
      get: [this.utils.roles.SUPER_ADMIN, this.utils.roles.ADMIN],
      create: [this.utils.roles.SUPER_ADMIN, this.utils.roles.ADMIN],
      update: [this.utils.roles.SUPER_ADMIN, this.utils.roles.ADMIN],
      delete: [this.utils.roles.SUPER_ADMIN, this.utils.roles.ADMIN],
    };
  }
  async getAll({ __longToken }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "get")) {
        return this.errorHandlers.nonAuthorizedError(
          "Insufficient permissions"
        );
      }

      return await this.mongomodels.classroom.find({});
    } catch (err) {
      console.error(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }

  async getByID({ __longToken, params: { id } }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "get")) {
        return this.errorHandlers.nonAuthorizedError(
          "Insufficient permissions"
        );
      }
      const errors = await this.validators.classroom.getByID({ id });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }

      return (
        (await this.mongomodels.classroom.findById(id)) ||
        this.errorHandlers.notFoundError(this.name)
      );
    } catch (err) {
      console.error(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }
  async create({ __longToken, name, schoolID }) {
    try {
      console.log(this.errorHandlers);
      const { userId, role } = __longToken;
      if (!this.utils.hasScope(this.scopes, role, "create")) {
        return this.errorHandlers.nonAuthorizedError(
          "Insufficient permissions"
        );
      }
      console.log({ name, schoolID });
      //check if this is admin then check if they have access
      if (
        role !== this.utils.roles.SUPER_ADMIN &&
        !(await isAllowedAdminCreate(this.mongomodels, userId, schoolID))
      ) {
        return this.errorHandlers.nonAuthorizedError(
          "This admin doesn't have access to this school"
        );
      }

      const errors = await this.validators.classroom.create({ name, schoolID });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }

      const existingClassroom = await this.mongomodels.classroom.findOne({
        name,
        school: schoolID,
      });
      if (existingClassroom) {
        return this.errorHandlers.conflictError(this.name);
      }

      //TODO: add this in a transaction with a rollback to ensure integrity
      return await this.mongomodels.classroom.create({
        name,
        school: schoolID,
      });
    } catch (err) {
      console.error(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }

  async update({ __longToken, name, params: { id } }) {
    try {
      const { userId, role } = __longToken;
      if (
        role !== this.utils.roles.SUPER_ADMIN &&
        !(await this.isAllowedAdminUpdate(this.mongomodels, userId, id))
      ) {
        return this.errorHandlers.nonAuthorizedError(
          "This admin doesn't have access to this school"
        );
      }
      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "update")) {
        return this.errorHandlers.nonAuthorizedError(
          "Insufficient permissions"
        );
      }
      const errors = await this.validators.classroom.update({ id, name });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }
      const classroom = await this.mongomodels.classroom.findById(id);
      if (!classroom) {
        return this.errorHandlers.notFoundError(this.name);
      }

      return this.mongomodels.classroom.updateOne(
        { _id: id },
        { $set: { name } }
      );
    } catch (err) {
      console.error(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }

  async delete({ __longToken, params: { id } }) {
    try {
      const { userId, role } = __longToken;
      if (
        role !== this.utils.roles.SUPER_ADMIN &&
        !(await this.isAllowedAdminUpdate(this.mongomodels, userId, id))
      ) {
        return this.errorHandlers.nonAuthorizedError(
          "This admin doesn't have access to this school"
        );
      }
      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "delete")) {
        return this.errorHandlers.nonAuthorizedError(
          "Insufficient permissions"
        );
      }
      const errors = await this.validators.classroom.delete({ id });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }
      console.log(this.mongomodels);
      const relatedStudents = await this.mongomodels.student.find({
        classroom: id,
      });
      if (!this.utils.isEmpty(relatedStudents)) {
        return this.errorHandlers.conflictError(
          "Cannot delete school because dependent students exist"
        );
      }

      return this.mongomodels.classroom.findByIdAndDelete(id);
    } catch (err) {
      console.error(err);
      return this.errorHandlers.internalServerError(err.message);
    }
  }
  isAllowedAdminUpdate = async (repo, userId, id) => {
    console.log(await repo.classroom.findById(id));
    const classroom = await repo.classroom.findById(id);
    if (!classroom) {
      return this.errorHandlers.notFoundError(this.name);
    }
    const user = await repo.user.findById(userId);
    if (!user) {
      return this.errorHandlers.notFoundError("user");
    }
    console.log(user.school)
    console.log(classroom.school)
    return user.school.toString() === classroom.school.toString();
  };

  isAllowedAdminCreate = async (repo, userId, id) => {
    const user = await repo.user.findById(userId);
    if (!user) {
      return this.errorHandlers.notFoundError("user");
    }
    return user.school.toString() === id.toString();
  };
}

module.exports = Classroom;
