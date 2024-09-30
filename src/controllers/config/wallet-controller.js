const walletService = require("../../services/wallet-service");
const { tryCatch } = require("../../utils/helper");
const Response = require("../../utils/response-handler");

const getWallets = async (req, res) => {
  const data = await walletService.getAllWallets();
  return Response.Success(res, data);
};

const getWalletAdmin = async (req, res) => {
  const data = await walletService.getWalletAdmin();
  return Response.Success(res, data);
};

const getWalletById = tryCatch(async (req, res) => {
  const { walletId } = req.params;
  const data = await walletService.getWalletById(walletId);
  return Response.Success(res, data);
});

const getWalletByUser = async (req, res) => {
  const { userId } = req.params;
  const data = await walletService.getWalletByUser(userId);
  if (!data) return Response.NotFound("Data not found", 404);
  return Response.Success(res, data);
};

const storeWalletAdmin = tryCatch(async (req, res) => {
  const data = req.body;
  await walletService.storeWallet(data);
  return Response.Success(res, null, "Data has been saved successfully");
});

const deleteWalletById = tryCatch(async (req, res) => {
  const { walletId } = req.params;
  await walletService.deleteWalletById(walletId);
  return Response.Success(res, null, "Data has been deleted successfully");
});

const updateWalletById = tryCatch(async (req, res) => {
  const { walletId } = req.params;
  const data = req.body;
  await walletService.updateWallet(walletId, data);
  return Response.Success(res, null, "Data has been saved successfully");
});

module.exports = {
  getWallets,
  getWalletById,
  storeWalletAdmin,
  getWalletByUser,
  deleteWalletById,
  updateWalletById,
  getWalletAdmin,
};
