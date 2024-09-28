const Response = require("../utils/response-handler");

const adminService = require("../services/admin-service");

const walletAdmin = async (req, res) => {
  const data = await adminService.getWalletAdmin();
  return Response.Success(res, data);
};

module.exports = {
  walletAdmin,
};
