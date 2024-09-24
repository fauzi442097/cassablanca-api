const { Op } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");

const { ranking_req } = initModels(db);

const getDataByRankingIdAndReqType = async (rankingId, reqTypeId) => {
  return await ranking_req.findOne({
    where: {
      [Op.and]: [{ ranking_id: rankingId }, { ranking_req_type_id: reqTypeId }],
    },
  });
};

const updateByRankingIdAndReqType = async (rankingId, data, transaction) => {
  return await ranking_req.update(
    {
      ranking_id_member: data.levelId,
      value: data.value,
    },
    {
      where: {
        ranking_id: rankingId,
        ranking_req_type_id: data.id,
      },
      returning: true,
    },
    transaction
  );
};

const getDataByRankingId = async (rankingId) => {
  return await ranking_req.findAll({
    where: {
      ranking_id: rankingId,
    },
  });
};

const store = async (data, transaction) => {
  return await ranking_req.create(data, {
    returning: true,
    transaction,
  });
};

const deleteMultipe = async (arrId, transaction) => {
  return await ranking_req.destroy({
    where: {
      id: {
        [Op.in]: arrId,
      },
    },
    transaction,
  });
};

const deleteByRankingId = async (rankingId, transaction) => {
  return await ranking_req.destroy({
    where: {
      ranking_id: rankingId,
    },
    transaction,
    returning: true,
  });
};

module.exports = {
  getDataByRankingIdAndReqType,
  updateByRankingIdAndReqType,
  store,
  deleteMultipe,
  getDataByRankingId,
  deleteByRankingId,
};
