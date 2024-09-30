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
  if (!data) return Response.NotFound(res, "Data not found");
  return Response.Success(res, data);
};

const storeCoin = tryCatch(async (req, res) => {
  const data = req.body;
  await coinService.storeCoin(data, req.user.id);
  return Response.Success(res, null, "Data has been saved successfully");
});

const updateCoin = tryCatch(async (req, res) => {
  const data = req.body;
  const { coinId } = req.params;
  await coinService.updateCoin(coinId, data, req.user.id);
  return Response.Success(res, null, "Data has been saved successfully");
});

const deleteCoin = tryCatch(async (req, res) => {
  const { coinId } = req.params;
  await coinService.removeCoin(coinId, req.user.id);
  return Response.Success(res, null, "Data has been deleted successfully");
});

module.exports = {
  getCoins,
  getSingleCoin,
  storeCoin,
  updateCoin,
  deleteCoin,
};
