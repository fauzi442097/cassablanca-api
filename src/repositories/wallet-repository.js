const db = require("../config/database");
const initModels = require("../models/init-models");

const { wallet, reff_wallet_type, coin } = initModels(db);

const getAll = async () => {
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
  });
  return data;
};

const getDataById = async (walletId) => {
  const data = await wallet.findOne({
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

module.exports = {
  getAll,
  getDataById,
  store,
  deleteById,
  update,
  getDataByUserId,
};
