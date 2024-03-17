const bcrypt = require("bcrypt");

class User {
  constructor({
    errorHandlers,
    utils,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.utils = utils
    this.errorHandlers = errorHandlers
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.name = "user";
    this.httpExposed = ["create", "login"];
    this.scopes = {
      get: [this.utils.roles.SUPER_ADMIN],
      create: [this.utils.roles.SUPER_ADMIN],
      update: [this.utils.roles.SUPER_ADMIN],
      delete: [this.utils.roles.SUPER_ADMIN],
    };
  }

  async create({ __longToken, email, password, role, schoolID }) {
    //By Default a super admin is created unless specified
    const userData = { email, password , role , schoolID };
    const { role: myRole } = __longToken;

    //check if the user has valid class scopes
    if (!this.utils.hasScope(this.scopes, myRole, "create")) {
      return this.errorHandlers.nonAuthorizedError("Insufficient permissions");
    }
    // Data validation

    const errors =
      role === this.utils.roles.SUPER_ADMIN
        ? await this.validators.user.createSuperAdmin(userData)
        : await this.validators.user.createAdmin(userData);

    if (errors) {
      const messages = errors.map((error) => error.message);
      return this.errorHandlers.validationError(messages);
    }

    try {
      const existingUser = await this.mongomodels.user.findOne({ email });
      if (existingUser) {
        return this.errorHandlers.this.errorHandlers.conflictError(this.name);
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);


      const savedUser = await this.mongomodels.user.create({
        email,
        role,
        password: passwordHash,
        school: schoolID, // Set the school ID if role is admin
      })
      console.log(savedUser)
      const longToken = this.tokenManager.genLongToken({
        userId: savedUser._id,
        role,
      });

      return { code: 201, data: { savedUser, longToken } };
    } catch (err) {
      console.error("Error creating user:", err);
      return this.errorHandlers.internalServerError(err.message);

    }
  }

  async login({ email, password }) {
    try {
      const user = await this.mongomodels.user.findOne({ email });
      const errors = await this.validators.user.login({ email, password });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return this.errorHandlers.validationError(messages);
      }
      if (!user) {
        return this.errorHandlers.notFoundError(this.name);
      }
      const isMatchHash = await bcrypt.compare(password, user.password);
      if (!isMatchHash) {
        return this.errorHandlers.nonAuthorizedError("Invalid credentials");
      }

      const token = this.tokenManager.genLongToken({
        userId: user.id,
        role: user.role,
      });

      return { user, token };
    } catch (error) {
      console.error("Login Error", error);
      return this.errorHandlers.internalServerError(err.message);
    }
  }
}

module.exports = User;
