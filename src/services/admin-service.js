const walletRepository = require("../repositories/wallet-repository");

const getWalletAdmin = async () => {
  const depositWallet = await walletRepository.getWalletAdminByType("deposit");
  const withdrawalWallet = await walletRepository.getWalletAdminByType(
    "withdrawal"
  );

  return {
    wallet: {
      deposit: depositWallet,
      withdrawal: withdrawalWallet,
    },
  };
};

module.exports = {
  getWalletAdmin,
};
