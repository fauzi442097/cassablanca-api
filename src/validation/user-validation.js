const { z } = require("../config/zod-language");

const requestOTPValidation = z.object({
  email: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .email(),
});

const requestVerifyOtpValidation = z.object({
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
    .max(50),
  referal_code: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(8),
});

const registerMemberSchema = z.object({
  email: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .email(),
  full_name: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(50, "Wajib diisi"),
  parent_id: z.number().positive().nullable(),
});

module.exports = {
  requestOTPValidation,
  requestVerifyOtpValidation,
  signUpSchema,
  registerMemberSchema,
};
