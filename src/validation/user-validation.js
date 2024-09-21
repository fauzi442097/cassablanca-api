const Joi = require("joi");

const requestOTPValidation = Joi.object({
  email: Joi.string().email().max(100).required(),
});

module.exports = {
  requestOTPValidation,
};
