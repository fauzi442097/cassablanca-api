const logger = require("../config/logging");
const Response = require("../utils/response-handler");

// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Log error detail ke file
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  logger.error({
    message: err.message,
    statusCode: statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  return Response.Error(res, err.message);
};

module.exports = errorHandler;
