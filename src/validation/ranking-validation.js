const { z } = require("zod");

const configBonusSchema = z.object({
  direct_bonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
  ranking_bonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
  global_bonus: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
});

module.exports = {
  configBonusSchema,
};
