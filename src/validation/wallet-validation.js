const { z } = require("zod");

const walletSchema = z.object({
  coin_id: z.string({ required_error: "Required" }).min(1, "Required").max(10),
  address: z.string({ required_error: "Required" }).max(150),
});

const updateWalletSchema = z.object({
  address: z.string({ required_error: "Required" }).max(150),
});

const verifyOTPWalletSchema = z.object({
  wallet_id: z.number({ required_error: "Required" }).positive(),
  otp: z
    .string()
    .length(6, { message: "OTP must be a 6-digit number" })
    .regex(/^\d+$/, { message: "OTP must be in numeric format" }),
});

const resendOTPWalletSchema = z.object({
  wallet_id: z.number({ required_error: "Required" }).positive(),
});

const deletWalletSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be a 6-digit number" })
    .regex(/^\d+$/, { message: "OTP must be in numeric format" }),
});

module.exports = {
  walletSchema,
  updateWalletSchema,
  verifyOTPWalletSchema,
  resendOTPWalletSchema,
  deletWalletSchema,
};
