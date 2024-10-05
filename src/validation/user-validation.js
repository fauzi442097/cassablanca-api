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

const updateProfileSchema = z.object({
  full_name: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(50),
  email: z.string({ required_error: "Required" }).min(1, "Required").email(),
  photo_url: z
    .object({
      filename: z.string().min(1, "Filename is required.").nullable(),
      content: z.string().refine(
        (data) => {
          return /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/.test(data);
        },
        {
          message: "Invalid Base64 string.",
        }
      ),
    })
    .nullable()
    .optional(),
});

module.exports = {
  requestOTPValidation,
  requestVerifyOtpValidation,
  signUpSchema,
  registerMemberSchema,
  updateProfileSchema,
};
