const walletRepository = require("../repositories/wallet-repository");

const getWalletAdmin = async () => {
  return await walletRepository.getDataByUserId(0);
};

module.exports = {
  getWalletAdmin,
};
