const { nullable } = require("zod");
const { z } = require("../config/zod-language");

const userStatusSchema = z.object({
  user_status_nm: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(30),
});

const walletTypeSchema = z.object({
  wallet_type_nm: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(30),
});

const withdrawalStatusSchema = z.object({
  withdrawal_status_nm: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(30),
});

const withBonusStatusSchema = z.object({
  bonus_status_nm: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(30),
});

const currencySchema = z.object({
  currency_name: z
    .string({ required_error: "Required" })
    .min(1, "Required")
    .max(10),
  min_withdrawal: z.number().int().positive().nullable(),
});

const chainSchema = z.object({
  // id: z.string({ required_error: "Required" }).min(1, "Required").max(10),
  chain_nm: z.string({ required_error: "Required" }).min(1, "Required").max(30),
  confirm_cnt: z
    .number({ required_error: "Required" })
    .min(0)
    .max(100)
    .nullable()
    .optional(),
  logo: z
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
  userStatusSchema,
  walletTypeSchema,
  withdrawalStatusSchema,
  withBonusStatusSchema,
  currencySchema,
  chainSchema,
};
