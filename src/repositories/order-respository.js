const { Op } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");

const { orders, product, member } = initModels(db);

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
    include: [
      {
        model: product,
        as: "product",
      },
    ],
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

const getHistoryOrder = async (params) => {
  let offset;
  let limit;
  let whereClause = {};

  if (params.search) {
    whereClause[Op.or] = [
      { fullname: { [Op.iLike]: `%${params.search}%` } },
      { email: { [Op.iLike]: `%${params.search}%` } },
    ];
  }

  let queryType = "findAll";
  if (params.page && params.size) {
    offset = (params.page - 1) * params.size;
    limit = parseInt(params.size);
    queryType = "findAndCountAll";
  }

  const response = await orders[queryType]({
    include: [
      {
        model: product,
        as: "product",
        attributes: [
          "curr_id",
          "price",
          "sharing_pct_usdt",
          "sharing_pct_product",
        ],
      },
      {
        model: member,
        as: "member",
        attributes: ["email", "fullname"],
        where: whereClause,
      },
    ],
    order: [["id", "DESC"]],
    offset: offset,
    limit: limit,
  });

  if (params.page && params.size) {
    return {
      items: response.rows,
      pagination: {
        total_records: response.count,
        total_pages: Math.ceil(response.count / params.size),
        current_page: params.page,
      },
    };
  }

  return response;
};

const getOrderPending = async () => {
  const data = await orders.findAll({
    include: [
      {
        attributes: ["email", "fullname", "member_id_parent"],
        model: member,
        as: "member",
      },
      {
        model: product,
        as: "product",
        attributes: ["curr_id", "price"],
      },
    ],
    where: {
      order_sts_id: "waiting_approve",
    },
    order: [["id", "DESC"]],
  });

  return data;
};

module.exports = {
  store,
  getOrderPendingByMemberAndTrxId,
  getOrderByid,
  getOrderPendingByMemberId,
  approveOrderById,
  getHistoryOrder,
  getOrderPending,
};
