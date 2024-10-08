const db = require("../config/database");
const initModels = require("../models/init-models");
const { getRequestObject } = require("../utils/helper");
const ResponseError = require("../utils/response-error");
const jwt = require("jsonwebtoken");

const { audits } = initModels(db);
const { Op } = require("sequelize");

const getAll = async (userLoginId, page, size, search) => {
  const offset = (page - 1) * size;
  let whereCondition = {};

  if (userLoginId) {
    whereCondition.user_id = userLoginId;
  }

  if (search) {
    whereCondition.event = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const result = await audits.findAndCountAll({
    where: whereCondition,
    limit: size,
    offset: offset,
  });

  const dataPagination = {
    items: result.rows,
    pagination: {
      total_records: result.count,
      total_pages: Math.ceil(result.count / size),
      current_page: page,
    },
  };

  return dataPagination;
};

const getDataById = async (auditId) => {
  const data = await audits.findByPk(auditId);
  if (!data) throw new ResponseError("Data not found", 404);
  return data;
};

const store = async (data, transaction) => {
  const req = getRequestObject();

  let userId = data.user_id;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      userId = user.id;
    });
  }

  const dataAudit = {
    user_id: userId,
    event: data.event,
    auditable_id: data.model_id,
    auditable_type: data.model_name,
    old_values: JSON.stringify(data.old_values),
    new_values: data.new_values ? JSON.stringify(data.new_values) : null,
    url: req.originalUrl,
    ip_address: req.ip,
    user_agent: req.headers["user-agent"],
  };

  const withTransaction = transaction ? { transaction } : {};
  await audits.create(dataAudit, withTransaction);
};

module.exports = {
  getAll,
  getDataById,
  store,
};
