const db = require("../config/database");
const initModels = require("../models/init-models");

const { coin, reff_chain, reff_curr } = initModels(db);

const getAll = async () => {
  return await coin.findAll({
    include: [
      {
        model: reff_curr,
        as: "curr",
      },
      {
        model: reff_chain,
        as: "chain",
      },
    ],
  });
};

const getDataById = async (id) => {
  return await coin.findOne({
    where: {
      id: id,
    },
    include: [
      {
        model: reff_curr,
        as: "curr",
      },
      {
        model: reff_chain,
        as: "chain",
      },
    ],
  });
};

const getDataByCurrAndChainId = async (currId, chainId) => {
  return await coin.findOne({
    where: {
      curr_id: currId,
      chain_id: chainId,
    },
  });
};

const store = async (data, transaction) => {
  return await coin.create(data, {
    returning: true,
    transaction,
  });
};

const update = async (id, data, transaction) => {
  return await coin.update(data, {
    where: {
      id: id,
    },
    returning: true,
    transaction,
  });
};

const remove = async (id, transaction) => {
  return await coin.destroy({
    where: {
      id: id,
    },
    returning: true,
    transaction,
  });
};

module.exports = {
  getAll,
  getDataById,
  store,
  update,
  getDataByCurrAndChainId,
  remove,
};
