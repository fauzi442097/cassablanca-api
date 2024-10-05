const Response = require("../utils/response-handler");

const userService = require("../services/user-service");
const { tryCatch } = require("../utils/helper");
const profile = async (req, res) => {
  const data = await userService.getProfile(req.user.id, req);
  return Response.Success(res, data);
};

const updateProfile = tryCatch(async (req, res) => {
  const body = req.body;
  await userService.updateProfile(body, req.user.id);
  return Response.Success(res, null, "Data has been saved successfully");
});

module.exports = {
  profile,
  updateProfile,
};
