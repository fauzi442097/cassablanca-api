const successResponse = (
  res,
  data = {},
  message = "success",
  statusCode = 200
) => {
  if (data) {
    return res.status(statusCode).json({
      message,
      data,
    });
  } else {
    return res.status(statusCode).json({
      message,
    });
  }
};

const errorResponse = (
  res,
  error = null,
  message = "Internal server error",
  statusCode = 500
) => {
  return res.status(statusCode).json({
    message: message,
    error:
      process.env.NODE_ENV === "development" || process.env.NODE_ENV === "local"
        ? error
        : undefined,
  });
};

const validationErrorResponse = (
  res,
  message = "Bad Request",
  errors,
  statusCode = 400
) => {
  return res.status(statusCode).json({
    message,
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
