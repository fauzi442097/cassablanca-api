const { z } = require("zod");

const confirmPaymentSchema = z.object({
  transaction_id: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(255),
  address_wallet_id: z.number({ required_error: "Wajib diisi" }).positive(),
  order_id: z.number().positive().nullable(),
  product_id: z.number({ required_error: "Wajib diisi" }).positive(),
  qty: z.number({ required_error: "Wajib diisi" }).positive(),
  amount: z.number({ required_error: "Wajib diisi" }).positive(),
});

module.exports = {
  confirmPaymentSchema,
};
