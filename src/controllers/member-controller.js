const { tryCatch, getUserLogin } = require("../utils/helper");
const Response = require("../utils/response-handler");

const memberService = require("../services/member-service");

const getAllMember = async (req, res) => {
  const data = await memberService.getAllMember(req.query);
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

const confirmPayment = tryCatch(async (req, res) => {
  const data = req.body;
  const otp = await memberService.confirmPaymentMember(data);
  return Response.Success(res, { otp });
});

const registerMember = tryCatch(async (req, res) => {
  const data = req.body;
  await memberService.registerMember(data, req.user);
  return Response.Success(res, null, "Registrasi member sukses");
});

module.exports = {
  activationRequest,
  confirmPayment,
  registerMember,
  getDownlineMember,
  getAllMember,
};
