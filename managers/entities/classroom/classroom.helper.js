const { nonAuthorizedError } = require("../errorHandlers");
//TODO to move auth into separate modules
const authorizeOperation = async (scopes, __longToken, functionName) => {
  const { role } = __longToken;
  if(!scopes[functionName].includes(role)){
    throw nonAuthorizedError("Insufficient permissions");

  } 
};

module.exports = { authorizeOperation };
