const { z } = require("../config/zod-language");

const requestOTPValidation = z.object({
  email: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .email(),
});

const requestVerifyOtpValidation = z.object({
  email: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .email(),
  otp: z
    .string()
    .length(6, { message: "OTP harus terdiri dari 6 digit" })
    .regex(/^\d+$/, { message: "OTP harus berupa angka" }),
});

const signUpSchema = z.object({
  email: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .email(),
  full_name: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(30),
  referal_code: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(8),
});

module.exports = {
  requestOTPValidation,
  requestVerifyOtpValidation,
  signUpSchema,
};
