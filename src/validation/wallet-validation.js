const { z } = require("zod");

const walletSchema = z.object({
  coin_id: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(10),
  address: z.string({ required_error: "Wajib diisi" }).max(150),
});

const updateWalletSchema = z.object({
  address: z.string({ required_error: "Wajib diisi" }).max(150),
});

const verifyOTPWalletSchema = z.object({
  wallet_id: z.number({ required_error: "Wajib diisi" }).positive(),
  otp: z
    .string()
    .length(6, { message: "OTP harus terdiri dari 6 digit" })
    .regex(/^\d+$/, { message: "OTP harus berupa angka" }),
});

const resendOTPWalletSchema = z.object({
  wallet_id: z.number({ required_error: "Wajib diisi" }).positive(),
});

const deletWalletSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP harus terdiri dari 6 digit" })
    .regex(/^\d+$/, { message: "OTP harus berupa angka" }),
});

module.exports = {
  walletSchema,
  updateWalletSchema,
  verifyOTPWalletSchema,
  resendOTPWalletSchema,
  deletWalletSchema,
};
