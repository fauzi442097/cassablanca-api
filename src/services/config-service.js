const db = require("../config/database.js");
const initModels = require("../models/init-models.js");
const { withTransaction } = require("../utils/helper.js");
const ResponseError = require("../utils/response-error.js");
const { ranking, ranking_req, reff_ranking_req_type } = initModels(db);

const rankingRepository = require("../repositories/ranking-repository.js");
const rankingReqRepository = require("../repositories/ranking-req-repository.js");
const auditService = require("../services/audit-service.js");

const getRangkings = async () => {
  const data = await rankingRepository.getAll({
    include: [
      {
        model: ranking_req,
        attributes: ["id", "ranking_req_type_id", "value", "curr_id"],
        as: "ranking_reqs",
        include: [
          {
            model: reff_ranking_req_type,
            as: "ranking_req_type",
          },
        ],
      },
    ],
  });
  return data;
};

const updateRanking = async (rankingId, data) => {
  const dataRanking = await rankingRepository.getDataById(rankingId);
  if (!dataRanking) throw new ResponseError("Data tidak ditemukan", 404);

  // Log Audit
  let dataAuditRanking = {
    event: "Update level",
    model_id: dataRanking.id,
    model_name: ranking.tableName,
    old_values: dataRanking,
  };

  return withTransaction(async (transaction) => {
    const newDataRanking = await rankingRepository.updateRankingName(
      rankingId,
      data.ranking_nm,
      transaction
    );

    dataAuditRanking = { ...dataAuditRanking, new_values: newDataRanking };
    await auditService.store(dataAuditRanking, transaction);

    for (const item of data.ranking_req_type) {
      const oldRankingReq =
        await rankingReqRepository.getDataByRankingIdAndReqType(
          rankingId,
          item.id
        );

      const newRankingReq =
        await rankingReqRepository.updateByRankingIdAndReqType(
          rankingId,
          item,
          transaction
        );

      // Log Audit
      let auditReqRanking = {
        event: `Update persyaratan untuk level ${dataRanking.ranking_nm}`,
        model_id: dataRanking.id,
        model_name: ranking_req.tableName,
        old_values: oldRankingReq,
        new_values: newRankingReq,
      };
      await auditService.store(auditReqRanking, transaction);
    }
  });
};

const getRangkingById = async (rankingId) => {
  const data = rankingRepository.getDataById(rankingId, {
    include: [
      {
        model: ranking_req,
        attributes: ["id", "ranking_req_type_id", "value", "curr_id"],
        as: "ranking_reqs",
        include: [
          {
            model: reff_ranking_req_type,
            as: "ranking_req_type",
          },
        ],
      },
    ],
  });

  if (!data) throw new ResponseError("Data tidak ditemukan", 404);
  return data;
};

const getRankingBonuses = async () => {
  const data = await ranking.findAll();
  return data;
};

const updateRankingBonus = async (data, rankingId) => {
  const oldData = await ranking.findByPk(rankingId);
  if (!oldData) throw new ResponseError("Data tidak ditemukan", 404);

  return withTransaction(async (transaction) => {
    const rankingUpdated = await rankingRepository.updateBonusRankingById(
      rankingId,
      data,
      {
        transaction,
      }
    );

    // Log Audit
    const dataAudit = {
      event: "Update bonus peringkat",
      model_id: rankingId,
      model_name: ranking.tableName,
      old_values: oldData,
      new_values: rankingUpdated,
    };

    await auditService.store(dataAudit, transaction);
  });
};

const getRankingBonusById = async (rankingId) => {
  const data = await rankingRepository.getDataById(rankingId);
  if (!data) throw new ResponseError("Data tidak ditemukan", 404);
  return data;
};

module.exports = {
  getRangkings,
  updateRanking,
  getRangkingById,
  getRankingBonuses,
  updateRankingBonus,
  getRankingBonusById,
};
