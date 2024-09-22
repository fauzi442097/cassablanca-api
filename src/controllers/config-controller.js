const { tryCatch } = require("../utils/helper");
const Response = require("../utils/response-handler");
const configService = require("../services/config-service");

const getLevel = tryCatch(async (req, res) => {
  const data = await configService.getRangkings();
  return Response.Success(res, data);
});

const getLevelByRankingId = tryCatch(async (req, res) => {
  const { rangkingId } = req.params;
  const data = await configService.getRangkingById(rangkingId);
  return Response.Success(res, data);
});

const getRankingBonus = tryCatch(async (req, res) => {
  const data = await configService.getRankingBonuses();
  return Response.Success(res, data);
});

const updateRankingBonus = tryCatch(async (req, res) => {
  const data = req.body;
  const { rankingId } = req.params;
  await configService.updateRankingBonus(data, rankingId);
  return Response.Success(res, null, "Data berhasil disimpan");
});

const getRakingBonusById = tryCatch(async (req, res) => {
  const { rankingId } = req.params;
  const data = await configService.getRankingBonusById(rankingId);
  return Response.Success(res, data);
});

module.exports = {
  getLevel,
  getLevelByRankingId,
  getRankingBonus,
  updateRankingBonus,
  getRakingBonusById,
};
