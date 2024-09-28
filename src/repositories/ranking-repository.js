const db = require("../config/database");
const initModels = require("../models/init-models");

const { ranking, ranking_req } = initModels(db);

const getAll = async (transaction) => {
  const data = await ranking.findAll(transaction);
  return data;
};

const getDataById = async (rankingId, transaction) => {
  const data = await ranking.findByPk(rankingId, transaction);
  return data;
};

const updateBonusRankingById = async (rankingId, data, transaction) => {
  return await ranking.update(data, {
    where: {
      id: rankingId,
    },
    returning: true,
    transaction,
  });
};

const updateRanking = async (rankingId, data, transaction) => {
  return await ranking.update(data, {
    where: {
      id: rankingId,
    },
    returning: true,
    transaction,
  });
};

const updateRankingName = async (rankingId, rankingName, transaction) => {
  return await ranking.update(
    {
      ranking_nm: rankingName,
    },
    {
      where: {
        id: rankingId,
      },
      returning: true,
      transaction,
    }
  );
};

const store = async (data, transaction) => {
  return await ranking.create(data, {
    returning: true,
    transaction,
  });
};

const deleteById = async (rankingId, transaction) => {
  return await ranking.destroy({
    where: {
      id: rankingId,
    },
    returning: true,
    transaction,
  });
};

const getActivationReq = async () => {
  return await ranking.findOne({
    include: [
      {
        model: ranking_req,
        as: "ranking_reqs",
        limit: 1,
        where: {
          ranking_req_type_id: "activated",
        },
      },
    ],
    where: {
      lvl: 1,
    },
  });
};

const getDataByLevel = async (level) => {
  return await ranking.findOne({
    include: [
      {
        model: ranking_req,
        as: "ranking_reqs",
      },
    ],
    where: {
      lvl: level,
    },
  });
};

const getTopLevel = async () => {
  return await ranking.findOne({
    order: [["lvl", "DESC"]],
    limit: 1,
  });
};

module.exports = {
  updateRanking,
  updateBonusRankingById,
  getAll,
  getDataById,
  updateRankingName,
  store,
  deleteById,
  getActivationReq,
  getDataByLevel,
  getTopLevel,
};
