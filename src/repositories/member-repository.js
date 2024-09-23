const db = require("../config/database");
const initModels = require("../models/init-models");

const { member } = initModels(db);

const getDataByEmail = async (email) => {
  return await member.findOne({
    where: {
      email: email,
    },
  });
};

const getDataByReferalCode = async (refCode) => {
  return await member.findOne({
    where: {
      referal_code: refCode,
    },
  });
};

const store = async (data, options = undefined) => {
  return await member.create(data, {
    returning: true,
    options,
  });
};

module.exports = {
  getDataByEmail,
  getDataByReferalCode,
  store,
};
