const { Op, fn } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");
const sequelize = require("sequelize");

const { bonus } = initModels(db);

const storeBonusUpline = async (data, transaction) => {
  return await bonus.bulkCreate(data, {
    returning: true,
    transaction,
  });
};

const getTotalBonusMemberByStatus = async (
  idMembers,
  status = "unrealized"
) => {
  return await bonus.findAll({
    attributes: [
      "member_id",
      [
        sequelize.fn(
          "SUM",
          sequelize.literal(`CASE WHEN curr_id = 'ORE' THEN amount END`)
        ),
        "total_ore",
      ],
      [
        sequelize.fn(
          "SUM",
          sequelize.literal(`CASE WHEN curr_id = 'USDT' THEN amount END`)
        ),
        "total_usdt",
      ],
    ],
    where: {
      member_id: {
        [Op.in]: idMembers,
      },
      bonus_status_id: status,
    },
    group: ["member_id"],
  });
};

const getBonusMemberByStatus = async (memberId, status) => {
  return await bonus.findAll({
    where: {
      [Op.and]: [
        {
          member_id: memberId,
        },
        {
          bonus_status_id: status,
        },
      ],
    },
  });
};

const setStatusToRealized = async (memberId, data, transaction) => {
  return await bonus.update(data, {
    where: {
      member_id: memberId,
      bonus_status_id: "unrealized",
    },
    returning: true,
    transaction,
  });
};

module.exports = {
  storeBonusUpline,
  getTotalBonusMemberByStatus,
  getBonusMemberByStatus,
  setStatusToRealized,
};
