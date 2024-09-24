const db = require("../config/database");
const initModels = require("../models/init-models");
const { users } = initModels(db);

const getDataByEmail = async (email) => {
  return await users.findOne({
    where: {
      email: email,
    },
  });
};

const updateOTPByUserId = async (userId, otp, expiredAt, options) => {
  await users.update(
    {
      otp: otp,
      expired_otp: expiredAt,
    },
    {
      where: {
        id: userId,
      },
    },
    options
  );
};

const getDataById = async (userId) => {
  return await users.findByPk(userId);
};

module.exports = {
  getDataByEmail,
  updateOTPByUserId,
  getDataById,
};
