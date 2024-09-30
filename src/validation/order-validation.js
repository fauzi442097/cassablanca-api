const { z } = require("zod");

const confirmPaymentSchema = z.object({
  transaction_id: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(255),
  address_wallet_id: z.number({ required_error: "Required" }).positive(),
  order_id: z.number().positive().nullable(),
  product_id: z.number({ required_error: "Required" }).positive(),
  qty: z.number({ required_error: "Required" }).positive(),
  amount: z.number({ required_error: "Required" }).positive(),
});

module.exports = {
  confirmPaymentSchema,
};
