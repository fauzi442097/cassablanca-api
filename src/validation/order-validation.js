const { z, nullable } = require("zod");

const confirmPaymentSchema = z.object({
  transaction_id: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(255),
  address_wallet_id: z.number({ required_error: "Required" }).positive(),
  order_id: z.number().positive().nullable(),
});

const rejectConfirmPaymentSchema = z.object({
  reason: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(255)
    .nullable(),
});

module.exports = {
  confirmPaymentSchema,
  rejectConfirmPaymentSchema,
};
