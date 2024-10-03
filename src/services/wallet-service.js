const walletRepository = require("../repositories/wallet-repository");
const userRepository = require("../repositories/user-repository");
const {
  withTransaction,
  generateOtp,
  setExpiredOTPInMinutes,
  sendEmailOTPWallet,
} = require("../utils/helper");
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
  if (!wallet) throw new ResponseError("Data not found", 404);
  return wallet;
};

const getWalletByUser = async (userId) => {
  return await walletRepository.getDataByUserId(userId);
};

const updateWallet = async (walletId, data) => {
  const dataExisting = await walletRepository.getDataById(walletId);
  if (!dataExisting) throw new ResponseError("Wallet not found", 404);

  if (dataExisting.address_temp) {
    throw new ResponseError(
      "Update failed. Please verify your data before updating your wallet information",
      400
    );
  }

  const otp = generateOtp();
  const expiredOTP = setExpiredOTPInMinutes(15);
  await sendEmailOTPWallet(otp, data.user_email_login);

  const walletDTO = {
    address_temp: data.address,
    otp: otp,
    expired_otp: expiredOTP,
    wallet_type_id: data.wallet_type_id,
    coin_id: data.coin_id,
    user_id: data.user_id,
  };

  return withTransaction(async (transaction) => {
    const walletCreated = await walletRepository.update(
      walletId,
      walletDTO,
      transaction
    );

    const AuditDTO = {
      event: `Update wallet`,
      model_id: dataExisting.id,
      model_name: wallet.tableName,
      old_values: dataExisting,
      new_values: walletCreated,
    };

    await auditService.store(AuditDTO, transaction);
  });
};

const storeWallet = async (data) => {
  const dataExisting = await walletRepository.getWalletUniqueMember(
    data.user_id,
    data.coin_id,
    data.wallet_type_id,
    data.address
  );
  if (dataExisting) throw new ResponseError("Wallet already exists", 400);

  const otp = generateOtp();
  const expiredOTP = setExpiredOTPInMinutes(15);

  await sendEmailOTPWallet(otp, data.user_email_login);

  const walletDTO = {
    coin_id: data.coin_id,
    user_id: data.user_id,
    otp: otp,
    expired_otp: expiredOTP,
    address_temp: data.address,
    wallet_type_id: data.wallet_type_id,
  };

  return withTransaction(async (transaction) => {
    const dataCreated = await walletRepository.store(walletDTO, transaction);
    const AuditDTO = {
      event: `Create wallet`,
      model_id: dataCreated.id,
      model_name: wallet.tableName,
      new_values: dataCreated,
    };
    await auditService.store(AuditDTO, transaction);
  });
};

const deleteWalletById = async (walletId, data) => {
  const dataExisting = await walletRepository.getDataById(walletId);
  if (!dataExisting) throw new ResponseError("Wallet not found", 404);

  const walletOtp = await walletRepository.getDataByOTP(data.otp);
  if (!walletOtp)
    throw new ResponseError(
      "Invalid OTP. Please check the code and enter it again",
      401
    );

  const currentData = new Date();
  if (currentData > dataExisting.expired_otp) {
    throw new ResponseError(
      "OTP code has expired. Please request a new code",
      401
    );
  }

  return withTransaction(async (transaction) => {
    await walletRepository.deleteById(walletId, transaction);

    const AuditDTO = {
      event: `Delete wallet`,
      model_id: dataExisting.id,
      model_name: wallet.tableName,
      old_values: dataExisting,
    };

    await auditService.store(AuditDTO, transaction);
  });
};

const createWalletMember = async (memberId, transaction, userLoginId) => {
  // Create Wallet
  const walletDeposit = [
    {
      coin_id: "USDT_tron",
      user_id: memberId,
      wallet_type_id: "deposit",
    },
    {
      coin_id: "USDT_tron",
      user_id: memberId,
      wallet_type_id: "withdrawal",
    },
  ];
  const walletCreated = await walletRepository.storeBulk(
    walletDeposit,
    transaction
  );

  // Log Audit
  dataAudit = {
    user_id: userLoginId || memberId,
    event: "Create wallet member",
    model_id: memberId,
    model_name: wallet.tableName,
    new_values: walletCreated,
  };
  await auditService.store(dataAudit, transaction);
};

module.exports = {
  getAllWallets,
  getWalletById,
  storeWallet,
  updateWallet,
  deleteWalletById,
  getWalletByUser,
  getWalletAdmin,
  createWalletMember,
};
