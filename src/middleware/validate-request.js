const Response = require("../utils/response-handler");
const { ZodError } = require("zod");

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const validationErrors = e.errors.reduce((acc, curr) => {
          const key = curr.path.join(".");
          const errorMessage = curr.message;

          if (!acc[key]) {
            acc[key] = [];
          }

          acc[key].push(errorMessage);
          return acc;
        }, {});

        return Response.BadRequest(
          res,
          "Validation failed. Please check your input.",
          validationErrors
        );
      } else {
        return Response.Error(res);
      }
    }
  };
};

module.exports = validateRequest;
