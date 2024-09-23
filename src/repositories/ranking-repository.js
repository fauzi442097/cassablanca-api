const db = require("../config/database");
const initModels = require("../models/init-models");

const { ranking } = initModels(db);

const getAll = async (options) => {
  const data = await ranking.findAll(options);
  return data;
};

const getDataById = async (rankingId, options) => {
  const data = await ranking.findByPk(rankingId, options);
  return data;
};

const updateBonusRankingById = async (rankingId, data, options = undefined) => {
  return await ranking.update(data, {
    where: {
      id: rankingId,
    },
    returning: true,
    options,
  });
};

const updateRankingName = async (
  rankingId,
  rankingName,
  options = undefined
) => {
  return await ranking.update(
    {
      ranking_nm: rankingName,
    },
    {
      where: {
        id: rankingId,
      },
      returning: true,
      options,
    }
  );
};

module.exports = {
  updateBonusRankingById,
  getAll,
  getDataById,
  updateRankingName,
};
