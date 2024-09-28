const { Op } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");

const { orders } = initModels(db);

const getOrderPendingByMemberAndTrxId = async (memberId, transactionId) => {
  return await orders.findOne({
    where: {
      [Op.and]: [
        { member_id: memberId },
        { chain_trx_id: transactionId },
        { order_sts_id: "waiting_approve" },
      ],
    },
  });
};

const getOrderPendingByMemberId = async (memberId) => {
  return await orders.findOne({
    where: {
      [Op.and]: [{ member_id: memberId }, { order_sts_id: "waiting_approve" }],
    },
  });
};

const getOrderByid = async (orderId) => {
  return await orders.findByPk(orderId);
};

const store = async (data, orderId, transaction) => {
  if (orderId) {
    return await orders.update(data, {
      where: {
        id: orderId,
      },
      returning: true,
      transaction,
    });
  }

  return await orders.create(data, {
    returning: true,
    transaction,
  });
};

const approveOrderById = async (orderId, data, transaction) => {
  return await orders.update(data, {
    where: {
      id: orderId,
    },
    returning: true,
    transaction,
  });
};

module.exports = {
  store,
  getOrderPendingByMemberAndTrxId,
  getOrderByid,
  getOrderPendingByMemberId,
  approveOrderById,
};
