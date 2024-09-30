const coinRepository = require("../repositories/coin-repository");
const { withTransaction } = require("../utils/helper");

const auditService = require("../services/audit-service");
const initModels = require("../models/init-models");
const db = require("../config/database");
const ResponseError = require("../utils/response-error");
const { coin } = initModels(db);

const getAllCoin = async () => {
  return await coinRepository.getAll();
};

const getCoinById = async (id) => {
  const coin = await coinRepository.getDataById(id);
  return coin;
};

const storeCoin = async (data, userId) => {
  const c = await coinRepository.getDataByCurrAndChainId(
    data.curr_id,
    data.chain_id
  );
  if (c) throw new ResponseError("Data is available", 400);

  const coinDTO = {
    id: data.curr_id + "_" + data.chain_id,
    ...data,
  };

  return withTransaction(async (transaction) => {
    const coinCreated = await coinRepository.store(coinDTO, transaction);

    // Log Audit
    const dataAudit = {
      user_id: userId,
      event: "Create Coin",
      model_id: coinCreated.id,
      model_name: coin.tableName,
      new_values: coinCreated,
    };

    await auditService.store(dataAudit, transaction);
  });
};

const updateCoin = async (coinId, data, userId) => {
  const coinExisting = await coinRepository.getDataById(coinId);
  if (!coinExisting) throw new ResponseError("Data not found", 404);

  const coinDTO = {
    ...data,
  };

  return withTransaction(async (transaction) => {
    const coinUpdated = await coinRepository.update(
      coinId,
      coinDTO,
      transaction
    );

    // Log Audit
    const dataAudit = {
      user_id: userId,
      event: "Update Coin",
      model_id: coinId,
      model_name: coin.tableName,
      old_values: coinExisting,
      new_values: coinUpdated,
    };

    await auditService.store(dataAudit, transaction);
  });
};

const removeCoin = async (coinId, userId) => {
  const coinExisting = await coinRepository.getDataById(coinId);
  if (!coinExisting) throw new ResponseError("Data not found", 404);

  return withTransaction(async (transaction) => {
    await coinRepository.remove(coinId, transaction);

    // Log Audit
    const dataAudit = {
      user_id: userId,
      event: "Delete Coin",
      model_id: coinId,
      model_name: coin.tableName,
      old_values: coinExisting,
    };

    await auditService.store(dataAudit, transaction);
  });
};

module.exports = {
  getAllCoin,
  getCoinById,
  storeCoin,
  updateCoin,
  removeCoin,
};
