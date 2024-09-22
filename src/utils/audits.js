const db = require("../config/database");
const initModels = require("../models/init-models");

const model = initModels(db);
const storeAudits = async (req, data, oldData) => {
  await model.audits.findAll();
};

module.exports = storeAudits;
