const walletRepository = require("../repositories/wallet-repository");
const { withTransaction } = require("../utils/helper");
const ResponseError = require("../utils/response-error");

const auditService = require("../services/audit-service");
const db = require("../config/database");
const initModels = require("../models/init-models");
const { Op } = require("sequelize");

const { wallet } = initModels(db);

const getAllWallets = async () => {
  return await walletRepository.getAll();
};

const getWalletAdmin = async () => {
  return await walletRepository.getDataByUserId(0);
};

const getWalletById = async (walletId) => {
  const wallet = await walletRepository.getDataById(walletId);
  if (!wallet) throw new ResponseError("Data tidak ditemukan", 404);
  return wallet;
};

const getWalletByUser = async (userId) => {
  return await walletRepository.getDataByUserId(userId);
};

const updateWallet = async (walletId, data) => {
  const dataExisting = await walletRepository.getDataById(walletId);
  if (!dataExisting) throw new ResponseError("Data tidak ditemukan", 404);

  return withTransaction(async (transaction) => {
    const walletCreated = await walletRepository.update(
      walletId,
      data,
      transaction
    );

    const AuditDTO = {
      event: `Update data address '${data.wallet_type_id}' - '${data.coin_id}'`,
      model_id: dataExisting.id,
      model_name: wallet.tableName,
      old_values: dataExisting,
      new_values: walletCreated,
    };

    await auditService.store(AuditDTO, transaction);
  });
};

const storeWallet = async (data) => {
  const dataExisting = await wallet.findOne({
    where: {
      [Op.and]: [
        { coin_id: data.coin_id },
        { address: data.address },
        { wallet_type_id: data.wallet_type_id },
        { user_id: data.user_id },
      ],
    },
  });
  if (dataExisting) throw new ResponseError("Data sudah digunakan", 400);

  return withTransaction(async (transaction) => {
    const dataCreated = await walletRepository.store(data, transaction);
    const AuditDTO = {
      event: `Tambah data address '${data.wallet_type_id}' - '${data.coin_id}'`,
      model_id: dataCreated.id,
      model_name: wallet.tableName,
      new_values: dataCreated,
    };
    await auditService.store(AuditDTO, transaction);
  });
};

const deleteWalletById = async (walletId) => {
  const dataExisting = await walletRepository.getDataById(walletId);
  if (!dataExisting) throw new ResponseError("Data tidak ditemukan", 404);

  return withTransaction(async (transaction) => {
    await walletRepository.deleteById(walletId, transaction);

    const AuditDTO = {
      event: `hapus data address '${dataExisting.wallet_type_id}' - '${dataExisting.coin_id}'`,
      model_id: dataExisting.id,
      model_name: wallet.tableName,
      old_values: dataExisting,
    };

    await auditService.store(AuditDTO, transaction);
  });
};

module.exports = {
  getAllWallets,
  getWalletById,
  storeWallet,
  updateWallet,
  deleteWalletById,
  getWalletByUser,
  getWalletAdmin,
};
