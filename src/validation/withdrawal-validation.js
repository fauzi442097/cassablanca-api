const { z } = require("zod");

const rejectWithdrawalSchema = z.object({
  reason: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(255)
    .nullable(),
});

module.exports = {
  rejectWithdrawalSchema,
};
