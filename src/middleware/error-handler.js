const logger = require("../config/logging");
const Response = require("../utils/response-handler");

// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.log(err);

  if (statusCode == 400) {
    return Response.BadRequest(res, err.message);
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

  return Response.Error(res, err.stack);
};

module.exports = errorHandler;
