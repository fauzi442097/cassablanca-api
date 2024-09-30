const { z } = require("zod");

const idMembersSchema = z.object({
  id_members: z.array(z.number().int().positive()),
});

const withdrawalSchema = z.object({
  transaction_id: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(100),
  amount: z.number({ required_error: "Required" }).positive(),
  wallet_id: z.number({ required_error: "Required" }).positive(),
});

const walletSchema = z.object({
  coin_id: z.string({ required_error: "Required" }).min(1, "Required").max(10),
  address: z.string({ required_error: "Required" }).min(1, "Required").max(255),
  wallet_type_id: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(15),
});

module.exports = {
  idMembersSchema,
  withdrawalSchema,
  walletSchema,
};
