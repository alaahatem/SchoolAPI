const bcrypt = require("bcrypt");
const {
  validationError,
  conflictError,
  notFoundError,
  nonAuthorizedError,
} = require("../errorHandlers");
const UserModel = require("./user.mongoModel");
const {hasScope, roles} = require("../_common/utils");
class User {
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
    this.name = "user";
    this.httpExposed = ["create", "login"];
    this.scopes = {
      get: [roles.SUPER_ADMIN],
      create: [roles.SUPER_ADMIN],
      update: [roles.SUPER_ADMIN],
      delete: [roles.SUPER_ADMIN],
    };
  }

  async create({ __longToken, email, password, role, schoolID }) {
    //By Default a super admin is created unless specified
    const userData = { email, password , role , schoolID };
    const { role: myRole } = __longToken;

    //check if the user has valid class scopes
    if (!hasScope(this.scopes, myRole, "get")) {
      return nonAuthorizedError("Insufficient permissions");
    }
    // Data validation

    const errors =
      role === roles.SUPER_ADMIN
        ? await this.validators.user.createSuperAdmin(userData)
        : await this.validators.user.createAdmin(userData);

    if (errors) {
      const messages = errors.map((error) => error.message);
      return validationError(messages);
    }

    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return conflictError(this.name);
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);


      const savedUser = UserModel.create({
        email,
        role,
        password: passwordHash,
        school: schoolID, // Set the school ID if role is admin
      })
      const longToken = this.tokenManager.genLongToken({
        userId: savedUser._id,
        role,
      });

      return { code: 201, data: { savedUser, longToken } };
    } catch (err) {
      console.error("Error creating user:", err);
    }
  }

  async login({ email, password }) {
    try {
      const user = await UserModel.findOne({ email });
      const errors = await this.validators.user.login({ email, password });

      if (errors) {
        const messages = errors.map((error) => error.message);
        return validationError(messages);
      }
      if (!user) {
        return notFoundError(this.name);
      }
      const isMatchHash = await bcrypt.compare(password, user.password);
      if (!isMatchHash) {
        return nonAuthorizedError("Invalid credentials");
      }

      const token = this.tokenManager.genLongToken({
        userId: user.id,
        role: user.role,
      });

      return { user, token };
    } catch (error) {
      console.error("Login Error", error);
      throw error;
    }
  }
}

module.exports = User;
