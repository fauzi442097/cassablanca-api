const { Op } = require("sequelize");
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

const getEmailAnotherUser = async (id, email) => {
  return await users.findOne({
    where: {
      id: {
        [Op.ne]: id,
      },
      email: email,
    },
  });
};

const getDataByOTP = async (otp) => {
  return await users.findOne({
    where: {
      otp: otp,
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

const getDataById = async (userId, config) => {
  return await users.findByPk(userId, config);
};

const updateProfile = async (userId, data, transaction) => {
  return await users.update(data, {
    where: {
      id: userId,
    },
    returning: true,
    transaction,
  });
};

const setVerified = async (userId, transaction) => {
  return await users.update(
    {
      email_verified: true,
    },
    {
      where: {
        id: userId,
      },
    },
    transaction
  );
};

module.exports = {
  getDataByEmail,
  updateOTPByUserId,
  getDataById,
  getDataByOTP,
  getEmailAnotherUser,
  updateProfile,
  setVerified,
};
