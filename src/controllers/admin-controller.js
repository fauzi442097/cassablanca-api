const Response = require("../utils/response-handler");

const adminService = require("../services/admin-service");
const { tryCatch } = require("../utils/helper");

const walletAdmin = async (req, res) => {
  const data = await adminService.getWalletAdmin();
  return Response.Success(res, data);
};

const bonusMember = async (req, res) => {
  const data = await adminService.getBonusMember(req.query);
  return Response.Success(res, data);
};

const distributeBonus = tryCatch(async (req, res) => {
  const { id_members } = req.body;
  await adminService.distributBonusMember(id_members, req.user.id);
  return Response.Success(
    res,
    null,
    "Bonus berhasil didistribusikan ke wallet member"
  );
});

const historyVerification = async (req, res) => {
  const data = await adminService.historyVerification(req.query);
  return Response.Success(res, data);
};

module.exports = {
  walletAdmin,
  bonusMember,
  distributeBonus,
  historyVerification,
};
