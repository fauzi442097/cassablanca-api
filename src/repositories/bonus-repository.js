const db = require("../config/database");
const initModels = require("../models/init-models");

const { bonus } = initModels(db);

const storeBonusUpline = async (data, transaction) => {
  return await bonus.bulkCreate(data, {
    returning: true,
    transaction,
  });
};

module.exports = {
  storeBonusUpline,
};
