const { Op } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");

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
    whereClause.withdrawal_status_id = "done";
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

module.exports = {
  store,
  getDataByUserIdAndStatus,
  updateStatusWithdrawal,
  getDataById,
  getAll,
};
