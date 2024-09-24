const { z } = require("zod");

const walletSchema = z.object({
  coin_id: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(10),
  user_id: z.number({ required_error: "Wajib diisi" }).min(0),
  address: z.string({ required_error: "Wajib diisi" }).max(150),
  wallet_type_id: z.string({ required_error: "Wajib diisi" }).max(30),
});

module.exports = {
  walletSchema,
};
