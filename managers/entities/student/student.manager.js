class School {
  constructor({
    utils,
    errorHandlers,
    config,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.errorHandlers = errorHandlers;
    this.utils = utils;
    this.config = config;
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
      get: [this.utils.roles.SUPER_ADMIN, this.utils.roles.ADMIN],
      create: [this.utils.roles.SUPER_ADMIN, this.utils.roles.ADMIN],
      update: [this.utils.roles.SUPER_ADMIN, this.utils.roles.ADMIN],
      delete: [this.utils.roles.SUPER_ADMIN, this.utils.roles.ADMIN],
    };
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
      const errors = await this.validators.student.getByID({ id });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }

      return (
        (await this.mongomodels.student.findById(id)) ||
        this.errorHandlers.notFoundError(this.name)
      );
    } catch (err) {
      console.error(err);
      return internalServerError(err.message);
    }
  }

  async getAll({ __longToken, classroomID }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "get")) {
        return this.errorHandlers.nonAuthorizedError(
          "Insufficient permissions"
        );
      }

      return await this.mongomodels.student.find(
        classroomID ? { classroom: classroomID } : {}
      );
    } catch (err) {
      console.error(err);
      return internalServerError(err.message);
    }
  }

  async create({ __longToken, name, age, classroomID }) {
    try {
      const { role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "create")) {
        return this.errorHandlers.nonAuthorizedError(
          "Insufficient permissions"
        );
      }
      const errors = await this.validators.student.create({
        name,
        age,
        classroomID,
      });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }

      const existingClassroom =
        this.mongomodels.classroom.findById(classroomID);
      if (!existingClassroom) {
        this.errorHandlers.notFoundError("Classroom");
      }
      return this.mongomodels.student.create({
        name,
        age,
        classroom: classroomID,
      });
    } catch (err) {
      console.error(err);
      return internalServerError(err.message);
    }
  }

  async update({ __longToken, name, age, classroomID, params: { id } }) {
    try {
      const { userId, role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "update")) {
        return this.errorHandlers.nonAuthorizedError(
          "Insufficient permissions"
        );
      }
      //check if this is admin then check if they have access
      if (
        role !== this.utils.roles.SUPER_ADMIN &&
        !(await this.isAllowedAdmin(this.mongomodels, userId, id))
      ) {
        return this.errorHandlers.nonAuthorizedError(
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
        return this.errorHandlers.validationError(messages);
      }

      return (
        (await this.mongomodels.student.findByIdAndUpdate(
          id,
          { name, age, classroom: classroomID },
          { new: true }
        )) || this.errorHandlers.notFoundError(this.name)
      );
    } catch (err) {
      console.log(err);
      return internalServerError(err.message);
    }
  }

  async delete({ __longToken, params: { id } }) {
    try {
      const { userId, role } = __longToken;

      //check if the user has valid class scopes
      if (!this.utils.hasScope(this.scopes, role, "delete")) {
        return this.errorHandlers.nonAuthorizedError(
          "Insufficient permissions"
        );
      }
      //check if this is admin then check if they have access
      if (
        role !== this.utils.roles.SUPER_ADMIN &&
        !(await this.isAllowedAdmin(this.mongomodels, userId, id))
      ) {
        return this.errorHandlers.nonAuthorizedError(
          "This admin doesn't have access to this student"
        );
      }
      const errors = await this.validators.student.delete({ id });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }
      // the return await here is for one liner conclusion for operands evaluation to complete

      return (
        (await this.mongomodels.student.findByIdAndDelete(id)) ||
        this.errorHandlers.notFoundError(this.name)
      );
    } catch (err) {
      console.log(err);
      return internalServerError(err.message);
    }
  }

  isAllowedAdmin = async (repo, userId, id) => {
    const student = await repo.student.findById(id).populate("classroom");
    if(!student){
      return  this.errorHandlers.notFoundError(this.name)
    }
    const user = await repo.user.findById(userId);
    return user.school.toString() === student.classroom?.school.toString();
  };
  
}

module.exports = School;
