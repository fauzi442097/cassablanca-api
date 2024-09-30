const { z } = require("zod");

const idMembersSchema = z.object({
  id_members: z.array(z.number().int().positive()),
});

const withdrawalSchema = z.object({
  transaction_id: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(100),
  amount: z.number({ required_error: "Wajib diisi" }).positive(),
  wallet_id: z.number({ required_error: "Wajib diisi" }).positive(),
});

const walletSchema = z.object({
  coin_id: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(10),
  address: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(255),
  wallet_type_id: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(15),
});

module.exports = {
  idMembersSchema,
  withdrawalSchema,
  walletSchema,
};
