const { tryCatch, getUserLogin } = require("../utils/helper");
const Response = require("../utils/response-handler");

const memberService = require("../services/member-service");

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
  await memberService.registerMember(data, req.user);
  return Response.Success(res, null, "Registrasi member sukses");
});

const verificationMember = tryCatch(async (req, res) => {
  const { memberId } = req.params;
  await memberService.verificationMember(memberId, req.user.id);
  return Response.Success(res, null, "Aktivasi member berhasil");
});

module.exports = {
  activationRequest,
  registerMember,
  getDownlineMember,
  getMembers,
  verificationMember,
};
