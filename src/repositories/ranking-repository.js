const db = require("../config/database");
const initModels = require("../models/init-models");
const { toSnakeCase } = require("../utils/helper");

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

const updateRanking = async (rankingId, data, options = undefined) => {
  return await ranking.update(
    {
      ranking_nm: data.levelName,
      direct_bonus: data.directBonus,
      ranking_bonus: data.rankingBonus,
      global_bonus: data.globalBonus,
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

const store = async (data, options) => {
  return await ranking.create(
    {
      id: data.id,
      ranking_nm: data.levelName,
      direct_bonus: data.directBonus,
      ranking_bonus: data.rankingBonus,
      global_bonus: data.globalBonus,
      lvl: data.lvl,
    },
    {
      returning: true,
      options,
    }
  );
};

module.exports = {
  updateRanking,
  updateBonusRankingById,
  getAll,
  getDataById,
  updateRankingName,
  store,
};
