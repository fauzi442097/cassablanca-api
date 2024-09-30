const { z } = require("zod");

const configBonusSchema = z.object({
  direct_bonus: z.number({ required_error: "Required" }).min(0).max(100),
  ranking_bonus: z.number({ required_error: "Required" }).min(0).max(100),
  global_bonus: z.number({ required_error: "Required" }).min(0).max(100),
});

const levelRequirementSchema = z.object({
  id: z.string({ required_error: "Required" }),
  level_id: z.string().nullable(),
  value: z.number({ required_error: "Required" }).positive().nullable(),
});

const levelSchema = z.object({
  level_name: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(30),
  level_requirement: z.array(levelRequirementSchema),
  direct_bonus: z.number({ required_error: "Required" }).min(0).max(100),
  ranking_bonus: z.number({ required_error: "Required" }).min(0).max(100),
  global_sharing: z.number({ required_error: "Required" }).min(0).max(100),
});

const configLevelSchema = z.object({
  ranking_nm: z.string({ required_error: "Required" }).max(30),
  ranking_req_type: z.array(levelRequirementSchema),
});

module.exports = {
  configBonusSchema,
  configLevelSchema,
  levelSchema,
};
