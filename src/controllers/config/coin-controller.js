const Response = require("../../utils/response-handler");

const coinService = require("../../services/coin-service");
const { tryCatch } = require("../../utils/helper");

const getCoins = async (req, res) => {
  const data = await coinService.getAllCoin();
  return Response.Success(res, data);
};

const getSingleCoin = async (req, res) => {
  const { coinId } = req.params;
  const data = await coinService.getCoinById(coinId);
  if (!data) return Response.NotFound(res, "Data tidak ditemukan");
  return Response.Success(res, data);
};

const storeCoin = tryCatch(async (req, res) => {
  const data = req.body;
  await coinService.storeCoin(data, req.user.id);
  return Response.Success(res, null, "Data berhasil disimpan");
});

const updateCoin = tryCatch(async (req, res) => {
  const data = req.body;
  const { coinId } = req.params;
  await coinService.updateCoin(coinId, data, req.user.id);
  return Response.Success(res, null, "Data berhasil disimpan");
});

const deleteCoin = tryCatch(async (req, res) => {
  const { coinId } = req.params;
  await coinService.removeCoin(coinId, req.user.id);
  return Response.Success(res, null, "Data berhasil dihapus");
});

module.exports = {
  getCoins,
  getSingleCoin,
  storeCoin,
  updateCoin,
  deleteCoin,
};
