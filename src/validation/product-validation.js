const { z } = require("zod");

const productSchema = z.object({
  curr_id: z
    .string({ required_error: "Wajib diisi" })
    .min(1, "Wajib diisi")
    .max(10),
  price: z.number({ required_error: "Wajib diisi" }).positive(),
  sharing_pct_usdt: z.number({ required_error: "Wajib diisi" }).min(0).max(100),
  sharing_pct_product: z
    .number({ required_error: "Wajib diisi" })
    .min(0)
    .max(100),
});

module.exports = {
  productSchema,
};
