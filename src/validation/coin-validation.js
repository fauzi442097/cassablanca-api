const { z } = require("zod");

const coinSchema = z.object({
  curr_id: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(10),
  chain_id: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(10),
});

module.exports = {
  coinSchema,
};
