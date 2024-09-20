const { loginService } = require("../services/auth-service");
const { tryCatch } = require("../utils/helper");
const Response = require("../utils/response-handler");

const login = tryCatch(async (req, res) => {
  const email = req.body.email;
  if (!email) return Response.BadRequest(res, "Email is required");
  const otp = await loginService(email);
  return Response.Success(res, { otp, email });
});

module.exports = {
  login,
};
