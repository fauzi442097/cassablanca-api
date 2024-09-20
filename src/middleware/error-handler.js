const Response = require("../utils/response-handler");

// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  return Response.Error(res, err.message);
};

module.exports = errorHandler;
