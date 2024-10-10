const { Op, fn, col } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");
const sequelize = require("sequelize");

const { users_balance_trx, users_balance, reff_curr } = initModels(db);

const storeBallance = async (data, transaction) => {
  return await users_balance_trx.create(data, {
    returning: true,
    transaction,
  });
};

const storeBulkBallance = async (data, transaction) => {
  return await users_balance_trx.bulkCreate(data, {
    returning: true,
    transaction,
  });
};

const getDataByUserId = async (userId) => {
  return await users_balance.findAll({
    where: {
      user_id: userId,
    },
  });
};

const createInitialBallanceMember = async (userId, transaction) => {
  const ballanceDTO = [
    {
      user_id: userId,
      curr_id: "ORE",
      balance: 0,
    },
    {
      user_id: userId,
      curr_id: "USDT",
      balance: 0,
    },
  ];
  await users_balance.bulkCreate(ballanceDTO, transaction);
};

const getBallanceUSDT = async (userId) => {
  return await users_balance.findOne({
    where: { user_id: userId, curr_id: "USDT" },
  });
};

const getHistoryTrxByUserId = async (userId, params) => {
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

  const result = await users_balance_trx[queryType]({
    attributes: [
      "id",
      "user_id",
      "curr_id",
      "amount",
      "dbcr",
      [
        sequelize.literal(
          `CASE WHEN dbcr = '0' THEN 'Debet' ELSE 'Kredit' END`
        ),
        "dbcr_type",
      ],
      "description",
      "created_at",
      [
        sequelize.literal(`TO_CHAR(created_at, 'DD-MM-YYYY HH24:MI:SS')`),
        "created_at_formatted",
      ],
    ],
    where: whereClause,
    order: [["created_at", "DESC"]],
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

const getRecentTransactionDownline = async (arrUserId, option) => {
  const data = await users_balance_trx.findAll({
    attributes: {
      include: [
        "created_at",
        [
          sequelize.fn("TO_CHAR", sequelize.col("created_at"), "Mon DD, YYYY"),
          "trx_date",
        ],
        [
          sequelize.fn("TO_CHAR", sequelize.col("created_at"), "HH24:MI"),
          "trx_time",
        ],
      ],
    },
    where: {
      user_id: {
        [Op.in]: [...arrUserId],
      },
    },
    order: [["id", "DESC"]],
    ...option,
  });

  return data;
};

const getTotalTransaction = async (option) => {
  return await users_balance_trx.count(option);
};

module.exports = {
  storeBallance,
  getBallanceUSDT,
  storeBulkBallance,
  createInitialBallanceMember,
  getDataByUserId,
  getHistoryTrxByUserId,
  getRecentTransactionDownline,
  getTotalTransaction,
};
