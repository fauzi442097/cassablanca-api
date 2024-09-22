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

const store = tryCatch(async (req, res) => {
  const data = req.body;
  const { ref_name, model_name } = req.params;
  await referensiService.store(data, model_name, ref_name);
  return Response.Success(res, null, "Data berhasil disimpan");
});

module.exports = {
  getAll,
  getById,
  store,
};
