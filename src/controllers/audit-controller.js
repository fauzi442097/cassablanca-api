const { tryCatch } = require("../utils/helper");
const auditService = require("../services/audit-service");
const Response = require("../utils/response-handler");

const getAllData = tryCatch(async (req, res) => {
  const { page, size, search } = req.query;
  const userLoginInd = req.user.id;
  const data = await auditService.getAll(
    userLoginInd,
    parseInt(page),
    parseInt(size),
    search
  );
  return Response.Success(res, data);
});

const getDataById = tryCatch(async (req, res) => {
  const { auditId } = req.params;
  const data = await auditService.getDataById(auditId);
  return Response.Success(res, data);
});

module.exports = {
  getAllData,
  getDataById,
};
