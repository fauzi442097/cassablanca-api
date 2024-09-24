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

const updateByRankingIdAndReqType = async (rankingId, data, options) => {
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
    options
  );
};

const store = async (data, options) => {
  return await ranking_req.create(
    data,
    {
      returning: true,
    },
    options
  );
};

const deleteMultipe = async (arrId, options) => {
  return await ranking_req.destroy({
    where: {
      id: {
        [Op.in]: arrId,
      },
    },
    options,
  });
};

module.exports = {
  getDataByRankingIdAndReqType,
  updateByRankingIdAndReqType,
  store,
  deleteMultipe,
};
