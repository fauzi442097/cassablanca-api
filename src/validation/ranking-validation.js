const { z } = require("zod");

const configBonusSchema = z.object({
  direct_bonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
  ranking_bonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
  global_bonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
});

const levelRequirementSchema = z.object({
  id: z.string({ required_error: "Wajib diisi" }),
  levelId: z.string().nullable(),
  value: z.number({ required_error: "Wajib diisi" }).positive().nullable(),
});

const levelSchema = z.object({
  levelName: z.string({ required_error: "Wajib diisi" }).max(30),
  levelRequirement: z.array(levelRequirementSchema),
  directBonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
  rankingBonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
  globalBonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
});

const configLevelSchema = z.object({
  ranking_nm: z.string({ required_error: "Wajib diisi" }).max(30),
  ranking_req_type: z.array(levelRequirementSchema),
});

module.exports = {
  configBonusSchema,
  configLevelSchema,
  levelSchema,
};
