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
  await memberService.registerMember(data, req.user.id);
  return Response.Success(res, null, "Registrasi member sukses");
});

const verificationMember = tryCatch(async (req, res) => {
  const { memberId } = req.params;
  const data = await memberService.verificationMember(memberId, req.user.id);
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

module.exports = {
  activationRequest,
  registerMember,
  getDownlineMember,
  getMembers,
  verificationMember,
  rejectVerificationMember,
  memberTree,
  blockMember,
};
