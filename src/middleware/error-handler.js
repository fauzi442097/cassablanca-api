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

  if (err instanceof Sequelize.BaseError) {
    // Log error detail ke file
    logger.error({
      message: err.errors || err.message,
      statusCode: statusCode,
      method: req.method,
      url: req.originalUrl,
      stack: err.stack,
    });

    let errorMessage = "";

    if (err.name == "SequelizeValidationError") {
      errorMessage = err.errors.map((e) => e.message).join(", ");
      return Response.BadRequest(res, "Validation error", errorMessage);
    } else if (err.name == "SequelizeUniqueConstraintError") {
      errorMessage = "Data sudah tersedia";
      return Response.Custom(res, 409, errorMessage, err.stack);
    } else if (err.name == "SequelizeForeignKeyConstraintError") {
      if (req.method == "DELETE") {
        errorMessage = "Tidak dapat dihapus. Data sedang digunakan";
      } else {
        errorMessage = "Operasi tidak dapat dilakukan. Data sedang digunakan";
      }
      return Response.BadRequest(res, errorMessage, undefined);
    } else {
      errorMessage = err.message;
    }

    return Response.Error(res, err.stack, errorMessage);
  }

  // Log error detail ke file
  logger.error({
    message: err.message,
    statusCode: statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });
  return Response.Error(res, err.stack);
};

module.exports = errorHandler;
