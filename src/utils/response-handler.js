const successResponse = (
  res,
  data = {},
  message = "success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    message,
    data,
  });
};

const errorResponse = (res, error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development" || process.env.NODE_ENV === "local"
        ? error
        : undefined,
  });
};

const validationErrorResponse = (res, errors, statusCode = 400) => {
  return res.status(statusCode).json({
    message: "Bad Request",
    errors,
  });
};

const unauthorizedResponse = (res, message) => {
  return res.status(401).json({
    message: message || "Unauthorized",
  });
};
const forbiddenResponse = (res, message) => {
  return res.status(403).json({
    message: message || "Forbidden",
  });
};

const notFoundResponse = (res, message = "Resource not found") => {
  return res.status(404).json({
    message: message,
  });
};

const Response = {
  Success: successResponse,
  Error: errorResponse,
  NotFound: notFoundResponse,
  BadRequest: validationErrorResponse,
  Unauthorized: unauthorizedResponse,
  Forbidden: forbiddenResponse,
};

module.exports = Response;
