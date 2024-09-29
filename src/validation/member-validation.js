const { z } = require("zod");

const idMembersSchema = z.object({
  id_members: z.array(z.number().int().positive()),
});

const withdrawalSchema = z.object({
  amount: z.number({ required_error: "Wajib diisi" }).positive(),
  address: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(255),
});

module.exports = {
  idMembersSchema,
  withdrawalSchema,
};
