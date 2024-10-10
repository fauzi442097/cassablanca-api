const { Op } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");
const sequelize = require("sequelize");

const { withdrawal, users, reff_withdrawal_status } = initModels(db);

const store = async (data, transaction) => {
  return await withdrawal.create(data, {
    returning: true,
    transaction,
  });
};

const getDataByUserIdAndStatus = async (userId, status) => {
  return await withdrawal.findOne({
    where: {
      user_id: userId,
      withdrawal_status_id: status,
    },
  });
};

const getAll = async (params) => {
  let offset;
  let limit;
  let whereClause = {};
  let queryType = "findAll";

  if (params && params.status) {
    whereClause.withdrawal_status_id = params.status;
  } else {
    whereClause.withdrawal_status_id = {
      [Op.in]: ["rejected", "new"],
    };
  }

  if (params && params.page && params.size) {
    offset = (params.page - 1) * params.size;
    limit = parseInt(params.size);
    queryType = "findAndCountAll";
  }

  const response = await withdrawal[queryType]({
    include: [
      {
        model: users,
        as: "member",
        attributes: ["email", "fullname", "role_id"],
        where: params.search
          ? {
              [Op.or]: [
                { fullname: { [Op.iLike]: `%${params.search}%` } },
                { email: { [Op.iLike]: `%${params.search}%` } },
              ],
            }
          : undefined,
      },
      {
        model: reff_withdrawal_status,
        as: "withdrawal_status",
      },
    ],
    order: [["id", "DESC"]],
    where: whereClause,
    offset: offset,
    limit: limit,
  });

  if (params && params.page && params.size) {
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

const getDataById = async (id) => {
  return await withdrawal.findByPk(id);
};

const updateStatusWithdrawal = async (id, status, transaction) => {
  return await withdrawal.update(
    {
      withdrawal_status_id: status,
    },
    {
      where: {
        id: id,
      },
      returning: true,
      transaction,
    }
  );
};

const getDataByUserId = async (userId, params) => {
  let offset;
  let limit;
  let whereClause = {};

  whereClause.user_id = userId;

  if (params && params.start_date && params.end_date) {
    whereClause.created_at = {
      [Op.between]: [
        params.start_date + " 00:00:00",
        params.end_date + " 23:59:59.999999",
      ],
    };
  }

  let queryType = "findAll";
  if (params && params.page && params.size) {
    offset = (params.page - 1) * params.size;
    limit = parseInt(params.size);
    queryType = "findAndCountAll";
  }

  const result = await withdrawal[queryType]({
    attributes: {
      include: [
        [
          sequelize.literal(`TO_CHAR(created_at, 'DD-MM-YYYY HH24:MI:SS')`),
          "created_at_formatted",
        ],
      ],
    },
    include: [
      {
        model: reff_withdrawal_status,
        as: "withdrawal_status",
      },
    ],
    where: whereClause,
    order: [["id", "DESC"]],
    offset: offset,
    limit: limit,
  });

  if (params && params.page && params.size) {
    return {
      items: result.rows,
      pagination: {
        total_records: result.count,
        total_pages: Math.ceil(result.count / params.size),
        current_page: params.page,
      },
    };
  }

  return result;
};

const updateWithdrawal = async (id, data, transaction) => {
  return await withdrawal.update(data, {
    where: {
      id: id,
    },
    returning: true,
    transaction,
  });
};

const getWithdrawalPending = async (option) => {
  return await withdrawal.findAll({
    include: [
      {
        attributes: ["email", "fullname"],
        model: users,
        as: "member",
      },
    ],
    where: {
      withdrawal_status_id: {
        [Op.in]: ["new", "waiting_approve"],
      },
    },
    ...option,
  });
};

const getWithdrawalByStatus = async (status, option) => {
  return await withdrawal.findAll({
    include: [
      {
        attributes: ["email", "fullname"],
        model: users,
        as: "member",
      },
    ],
    where: {
      withdrawal_status_id: {
        [Op.in]: [...status],
      },
    },
    order: [["id", "DESC"]],
    ...option,
  });
};

const getTotalWithdrawalMember = async (option) => {
  return await withdrawal.count(option);
};

module.exports = {
  store,
  getDataByUserIdAndStatus,
  updateStatusWithdrawal,
  getDataById,
  getAll,
  getDataByUserId,
  updateWithdrawal,
  getWithdrawalPending,
  getWithdrawalByStatus,
  getTotalWithdrawalMember,
};
