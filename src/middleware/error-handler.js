const { Sequelize } = require("sequelize");
const logger = require("../config/logging");
const Response = require("../utils/response-handler");

// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode == 400) {
    return Response.BadRequest(res, err.message);
  }

  if (statusCode == 404) {
    return Response.NotFound(res, err.message);
  }

  if (statusCode == 401) {
    return Response.Unauthorized(res, err.message);
  }

  // Log error detail ke file
  logger.error({
    message: err.message,
    statusCode: statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  if (err instanceof Sequelize.BaseError) {
    // Further check for specific error types
    let errorMessage = "";
    if (
      err instanceof Sequelize.ValidationError ||
      err instanceof Sequelize.UniqueConstraintError
    ) {
      errorMessage = err.errors.map((e) => e.message).join(", ");
    } else {
      errorMessage = err.message;
    }

    return Response.Error(res, err.stack, errorMessage);
  }

  return Response.Error(res, err.stack);
};

module.exports = errorHandler;
