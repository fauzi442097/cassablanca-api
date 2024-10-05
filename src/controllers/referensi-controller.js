const { tryCatch } = require("../utils/helper");
const Response = require("../utils/response-handler");

const referensiService = require("../services/referensi-service");

const getAll = tryCatch(async (req, res) => {
  const { model_name } = req.params;
  const data = await referensiService.getAllData(model_name);
  return Response.Success(res, data);
});

const getById = tryCatch(async (req, res) => {
  const { id, model_name } = req.params;
  const data = await referensiService.getDataById(id, model_name);
  if (!data) return Response.NotFound(res, "Data not found");
  return Response.Success(res, data);
});

const deleteById = tryCatch(async (req, res) => {
  const { id, model_name, ref_name } = req.params;
  await referensiService.deleteById(id, model_name, ref_name);
  return Response.Success(res, null, "Data has been deleted successfully");
});

const store = tryCatch(async (req, res) => {
  const data = req.body;
  const { ref_name, model_name } = req.params;
  await referensiService.store(data, model_name, ref_name);
  return Response.Success(res, null, "Data has been saved successfully");
});

const update = tryCatch(async (req, res) => {
  const data = req.body;
  const { ref_name, model_name, id } = req.params;
  await referensiService.update(id, data, model_name, ref_name);
  return Response.Success(res, null, "Data has been saved successfully");
});

const minimumWithdrawal = async (req, res) => {
  const { type } = req.query;
  const data = await referensiService.getMinimumWithdrawal(type);
  if (!data) return Response.NotFound(res, "Data not found");
  return Response.Success(res, data);
};

module.exports = {
  getAll,
  getById,
  store,
  update,
  deleteById,
  minimumWithdrawal,
};
