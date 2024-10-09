const Response = require("../utils/response-handler");

const adminService = require("../services/admin-service");
const { tryCatch } = require("../utils/helper");

const walletAdmin = async (req, res) => {
  const data = await adminService.getWalletAdmin();
  return Response.Success(res, data);
};

const bonusMember = tryCatch(async (req, res) => {
  const { bonusStatus } = req.params;
  const data = await adminService.getBonusMember(bonusStatus, req.query);
  return Response.Success(res, data);
});

const distributeBonus = tryCatch(async (req, res) => {
  const { id_members } = req.body;
  await adminService.distributBonusMember(id_members, req.user.id);
  return Response.Success(
    res,
    null,
    "Bonus distribution completed successfully"
  );
});

const historyVerification = async (req, res) => {
  const data = await adminService.historyVerification(req.query);
  return Response.Success(res, data);
};

const withdrawalMember = async (req, res) => {
  const data = await adminService.getAllWithdrawalMember(req.query);
  return Response.Success(res, data);
};

const rejectWithdrawal = tryCatch(async (req, res) => {
  const { withdrawalId } = req.params;
  const data = req.body;
  await adminService.rejectWithdrawalMember(withdrawalId, req.user.id, data);
  return Response.Success(res, null, "Data has been successfully rejected");
});

const approveWithdrawal = tryCatch(async (req, res) => {
  const { withdrawalId } = req.params;
  await adminService.approveWithdrawalMember(withdrawalId, req.user.id);
  return Response.Success(res, null, "Data has been successfully approved");
});

module.exports = {
  walletAdmin,
  bonusMember,
  distributeBonus,
  historyVerification,
  withdrawalMember,
  rejectWithdrawal,
  approveWithdrawal,
};
