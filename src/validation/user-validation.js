const { z } = require("../config/zod-language");

const requestOTPValidation = z.object({
  email: z.string({ required_error: "Required" }).min(1, "Required").email(),
});

const requestVerifyOtpValidation = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be a 6-digit number" })
    .regex(/^\d+$/, { message: "OTP must be in numeric format" }),
});

const signUpSchema = z.object({
  email: z.string({ required_error: "Required" }).min(1, "Required").email(),
  full_name: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(50),
  referal_code: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(8),
});

const registerMemberSchema = z.object({
  email: z.string({ required_error: "Required" }).min(1, "Required").email(),
  full_name: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(50, "Required"),
  parent_id: z.number().positive().nullable(),
});

module.exports = {
  requestOTPValidation,
  requestVerifyOtpValidation,
  signUpSchema,
  registerMemberSchema,
};
