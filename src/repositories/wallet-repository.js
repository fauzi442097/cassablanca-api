const { Op } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");

const { wallet, reff_wallet_type, coin, member } = initModels(db);

const getAll = async () => {
  const data = await wallet.findAll({
    attributes: { exclude: ["otp", "expired_otp"] },
    include: [
      {
        model: reff_wallet_type,
        as: "wallet_type",
      },
      {
        attributes: ["email", "fullname"],
        model: member,
        as: "member",
      },
      {
        model: coin,
        as: "coin",
      },
    ],
    order: [["id", "DESC"]],
  });
  return data;
};

const getDataByIdAndUserId = async (walletId, userId) => {
  return await wallet.findOne({
    where: {
      id: walletId,
      user_id: userId,
    },
  });
};

const getDataById = async (walletId) => {
  const data = await wallet.findOne({
    include: [
      {
        model: reff_wallet_type,
        as: "wallet_type",
      },
      {
        attributes: ["email", "fullname"],
        model: member,
        as: "member",
      },
      {
        model: coin,
        as: "coin",
      },
    ],
    where: {
      id: walletId,
    },
  });
  return data;
};

const getDataByUserId = async (userId) => {
  const data = await wallet.findAll({
    include: [
      {
        model: reff_wallet_type,
        as: "wallet_type",
      },
      {
        model: coin,
        as: "coin",
      },
    ],
    where: {
      user_id: userId,
    },
  });
  return data;
};

const store = async (data, transaction) => {
  return await wallet.create(data, {
    returning: true,
    transaction,
  });
};

const storeBulk = async (data, transaction) => {
  return await wallet.bulkCreate(data, {
    returning: true,
    transaction,
  });
};

const update = async (walletId, data, transaction) => {
  return await wallet.update(data, {
    where: {
      id: walletId,
    },
    returning: true,
    transaction,
  });
};

const deleteById = async (walletId, transaction) => {
  return await wallet.destroy({
    where: {
      id: walletId,
    },
    returning: true,
    transaction,
  });
};

const getAddressRequestActivation = async () => {
  const [results] = await db.query(`
  select 
    w.id,
    w.coin_id,
    c.curr_id,
    rc.chain_nm,
    rc.logo,
    w.address,
    w.wallet_type_id,
    rwt.wallet_type_nm
  from
    wallet w
  join reff_wallet_type rwt on
    rwt.id = w.wallet_type_id
  join coin c on
    c.id = w.coin_id
  join reff_chain rc on
    rc.id = c.chain_id
  where
    w.user_id = 0 and w.wallet_type_id = 'deposit'`);
  return results;
};

const getWalletAdminByType = async (type) => {
  return await wallet.findAll({
    attributes: { exclude: ["otp", "expired_otp"] },
    include: [
      {
        model: reff_wallet_type,
        as: "wallet_type",
      },
      {
        model: coin,
        as: "coin",
      },
    ],
    where: {
      user_id: 0,
      wallet_type_id: type,
    },
    order: [["id", "DESC"]],
  });
};

const getWalletByUserIdAndType = async (userId, type) => {
  return await wallet.findOne({
    include: [
      {
        model: coin,
        as: "coin",
      },
    ],
    where: {
      user_id: userId,
      wallet_type_id: type,
    },
  });
};

const getWalletByUserIdAndCoinId = async (userId, coinId) => {
  return await wallet.findOne({
    where: {
      user_id: userId,
      coin_id: coinId,
    },
  });
};

const getDataByOTP = async (otp) => {
  return await wallet.findOne({
    where: {
      otp: otp,
    },
  });
};

const verificationWallet = async (walletId, address, transaction) => {
  return await wallet.update(
    {
      address_temp: null,
      address: address,
      otp: null,
      expired_otp: null,
    },
    {
      where: {
        id: walletId,
      },
      returning: true,
      transaction,
    }
  );
};

const getWalletUniqueMember = async (
  userId,
  coinId,
  wallet_type_id,
  address
) => {
  return await wallet.findOne({
    where: {
      [Op.and]: [
        {
          user_id: userId,
          coin_id: coinId,
          wallet_type_id: wallet_type_id,
        },
        {
          [Op.or]: [{ address_temp: address }, { address: address }],
        },
      ],
    },
  });
};

module.exports = {
  getAll,
  getDataById,
  store,
  deleteById,
  update,
  getDataByUserId,
  getAddressRequestActivation,
  getWalletAdminByType,
  storeBulk,
  getWalletByUserIdAndType,
  getWalletByUserIdAndCoinId,
  getDataByIdAndUserId,
  getDataByOTP,
  verificationWallet,
  getWalletUniqueMember,
};
