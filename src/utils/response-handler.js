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
};

module.exports = Response;
