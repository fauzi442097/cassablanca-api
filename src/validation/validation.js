const ResponseError = require("../utils/response-error");
const Response = require("../utils/response-handler");

const validate = (schema, request) => {
  const { error } = schema.validate(request);
  if (error) {
    const validationErrors = error.details.reduce((acc, curr) => {
      const key = curr.path.join(".");

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(curr.message);

      return acc;
    }, {});

    console.log(validationErrors);
    throw error;

    // return Response.BadRequest(res, validationErrors);
  } else {
    return result.value;
  }
};

module.exports = validate;
