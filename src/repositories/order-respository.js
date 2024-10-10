const { Op } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");

const { orders, product, member, reff_order_status } = initModels(db);

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

const getDataById = async (orderId, option) => {
  return await orders.findByPk(orderId, option);
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
  let whereOrder = {};

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

  if (params.status && params.status != "") {
    whereOrder.order_sts_id = params.status;
  }

  if (params.start_date && params.end_date) {
    if (params.start_date != "" && params.end_date != "") {
      const startOfDay = new Date(params.start_date);
      startOfDay.setHours(0, 0, 0, 0); // Start of the day

      const endOfDay = new Date(params.end_date);
      endOfDay.setHours(23, 59, 59, 999); // End of the day

      whereOrder.created_at = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }
  }

  const response = await orders[queryType]({
    attributes: {
      include: ["created_at"],
    },
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
      {
        model: reff_order_status,
        as: "order_status",
      },
    ],
    where: whereOrder,
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

const getOrderPending = async (option) => {
  const data = await orders.findAll({
    include: [
      {
        attributes: ["email", "fullname", "member_id_parent", "photo_url"],
        model: member,
        as: "member",
        include: [
          {
            attributes: ["email", "fullname", "member_id_parent", "photo_url"],
            model: member,
            as: "parent",
          },
        ],
      },
    ],
    where: {
      order_sts_id: "waiting_approve",
    },
    order: [["id", "DESC"]],
    ...option,
  });

  return data;
};

const getAll = async (params) => {
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
    attributes: {
      include: ["created_at"],
    },
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
      {
        model: reff_order_status,
        as: "order_status",
      },
    ],
    where: {
      order_sts_id: {
        [Op.in]: ["waiting_approve", "reject"],
      },
    },
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

const getOrderByStatus = async (status, option) => {
  const data = await orders.findAll({
    include: [
      {
        attributes: ["email", "fullname", "member_id_parent", "photo_url"],
        model: member,
        as: "member",
        include: [
          {
            attributes: ["email", "fullname", "member_id_parent", "photo_url"],
            model: member,
            as: "parent",
          },
        ],
      },
    ],
    where: {
      order_sts_id: {
        [Op.in]: [...status],
      },
    },
    order: [["id", "DESC"]],
    ...option,
  });

  return data;
};

const getTotalActivationMember = async (option) => {
  return await orders.count(option);
};

const getRecentActivationDownline = async (arrMemberId, option) => {
  const data = await orders.findAll({
    include: [
      {
        attributes: ["email", "fullname", "member_id_parent", "photo_url"],
        model: member,
        as: "member",
        include: [
          {
            attributes: ["email", "fullname", "member_id_parent", "photo_url"],
            model: member,
            as: "parent",
          },
        ],
      },
    ],
    where: {
      order_sts_id: "done",
      member_id: {
        [Op.in]: [...arrMemberId],
      },
    },
    order: [["id", "DESC"]],
    ...option,
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
  getAll,
  getDataById,
  getOrderByStatus,
  getTotalActivationMember,
  getRecentActivationDownline,
};
