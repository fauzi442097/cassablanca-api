const db = require("../config/database");
const initModels = require("../models/init-models");

const { users_balance_trx } = initModels(db);

const storeBallance = async (data, transaction) => {
  return await users_balance_trx.create(data, {
    returning: true,
    transaction,
  });
};

const storeBulkBallance = async (data, transaction) => {
  return await users_balance_trx.bulkCreate(data, {
    returning: true,
    transaction,
  });
};

module.exports = {
  storeBallance,
  storeBulkBallance,
};
