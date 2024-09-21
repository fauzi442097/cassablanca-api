const Response = require("../utils/response-handler");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const validationErrors = error.details.reduce((acc, curr) => {
        const key = curr.path.join(".");

        // remove property name on message
        const errorMessage = curr.message.replace(/["']?[^"']+["']? /, "");

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(errorMessage);

        return acc;
      }, {});

      return Response.BadRequest(res, "Bad Request", validationErrors);
    }

    next();
  };
};

module.exports = validateRequest;
