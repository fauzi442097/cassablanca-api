const { tryCatch, getUserLogin } = require("../utils/helper");
const Response = require("../utils/response-handler");

const memberService = require("../services/member-service");
const walletService = require("../services/wallet-service");

const getMembers = async (req, res) => {
  const data = await memberService.getMembers(req.query);
  return Response.Success(res, data);
};

const getDownlineMember = async (req, res) => {
  const { memberId } = req.params;
  const { page, size, search } = req.query;

  const dataParam = { page, size, search };
  const data = await memberService.getDownlineMember(memberId, dataParam);
  return Response.Success(res, data);
};

const activationRequest = tryCatch(async (req, res) => {
  const data = await memberService.activationRequestMember();
  return Response.Success(res, data);
});

const registerMember = tryCatch(async (req, res) => {
  const data = req.body;
  await memberService.registerMember(data, req.user.id);
  return Response.Success(res, null, "Registrasi member sukses");
});

const verificationMember = tryCatch(async (req, res) => {
  const { memberId } = req.params;
  await memberService.verificationMember(memberId, req.user.id);
  return Response.Success(res, null, "Aktivasi member berhasil");
});

const rejectVerificationMember = tryCatch(async (req, res) => {
  const { memberId } = req.params;
  const data = await memberService.rejectVerificationMember(
    memberId,
    req.user.id
  );
  return Response.Success(res, null, "Berhasil direject");
});

const memberTree = tryCatch(async (req, res) => {
  const { parentId } = req.params;
  const data = await memberService.getMemberTree(parentId);
  return Response.Success(res, data);
});

const blockMember = tryCatch(async (req, res) => {
  const { memberId } = req.params;
  await memberService.blockMember(memberId, req.user.id);
  return Response.Success(res, null, "Member berhasil diblock");
});

const getWalletMember = async (req, res) => {
  const { memberId } = req.params;
  const data = await memberService.getWalletMember(memberId);
  return Response.Success(res, data);
};

const requestWithdrawal = tryCatch(async (req, res) => {
  let data = req.body;
  data.user_id = req.user.id;
  await memberService.requestWithdrawalMember(data);
  return Response.Success(res, null, "Request withdrawal sukses");
});

const createWallet = tryCatch(async (req, res) => {
  const data = req.body;
  const result = await memberService.createWallet(data, req.user);
  return Response.Success(
    res,
    result,
    "Data berhasil disimpan. Silakan lanjutkan untuk verifikasi dengan OTP"
  );
});

const updateWallet = tryCatch(async (req, res) => {
  const { walletId } = req.params;
  const data = req.body;
  data.wallet_id = walletId;
  const result = await memberService.updateWallet(data, req.user);
  return Response.Success(
    res,
    result,
    "Data berhasil disimpan. Silakan lanjutkan untuk verifikasi dengan OTP"
  );
});

const getSingeWallet = tryCatch(async (req, res) => {
  const { memberId, walletId } = req.params;
  const data = await memberService.getSingWalletMemberById(memberId, walletId);
  return Response.Success(res, data);
});

const verifyOTPWallet = tryCatch(async (req, res) => {
  const data = req.body;
  await memberService.verifyOTPWallet(data, req.user.id);
  return Response.Success(
    res,
    null,
    "OTP berhasil diverifikasi. Data berhasil diperbaharui"
  );
});

const resendOTPWallet = tryCatch(async (req, res) => {
  const data = req.body;
  await memberService.resendOTPWallet(data, req.user.id);
  return Response.Success(
    res,
    null,
    "OTP berhasil dikirim. Silakan periksa email Anda"
  );
});

const deleteWallet = tryCatch(async (req, res) => {
  const { memberId, walletId } = req.params;
  const { otp } = req.body;
  const param = { memberId, walletId, otp, userId: req.user.id };
  await memberService.deleteWallet(param);
  return Response.Success(res, null, "Wallet berhasil dihapus");
});

const balanceMember = async (req, res) => {
  const { memberId } = req.params;
  const data = await memberService.getBalanceMember(memberId);
  return Response.Success(res, data);
};

const historyTransactionBalance = async (req, res) => {
  const { memberId } = req.params;
  const data = await memberService.getHistoryTransactionBalance(
    memberId,
    req.query
  );
  return Response.Success(res, data);
};

const getTransactionWithdrawal = async (req, res) => {
  const data = await memberService.getHistoryWithdrawal(req.user.id, req.query);
  return Response.Success(res, data);
};

module.exports = {
  activationRequest,
  registerMember,
  getDownlineMember,
  getMembers,
  verificationMember,
  rejectVerificationMember,
  memberTree,
  blockMember,
  getWalletMember,
  requestWithdrawal,
  createWallet,
  updateWallet,
  getSingeWallet,
  verifyOTPWallet,
  resendOTPWallet,
  deleteWallet,
  balanceMember,
  historyTransactionBalance,
  getTransactionWithdrawal,
};
