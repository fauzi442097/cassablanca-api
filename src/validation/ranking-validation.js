const { z } = require("zod");

const configBonusSchema = z.object({
  direct_bonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
  ranking_bonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
  global_bonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
});

const rankingReqTypeSchema = z.object({
  id: z.string({ required_error: "Wajib diisi" }),
  ranking_id_member: z.string().nullable(),
  value: z.number({ required_error: "Wajib diisi" }).positive().nullable(),
});

const configLevelSchema = z.object({
  ranking_nm: z.string({ required_error: "Wajib diisi" }).max(30),
  ranking_req_type: z.array(rankingReqTypeSchema),
});

module.exports = {
  configBonusSchema,
  configLevelSchema,
};
