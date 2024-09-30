const { z } = require("zod");

const coinSchema = z.object({
  curr_id: z.string({ required_error: "Required" }).min(1, "Required").max(10),
  chain_id: z.string({ required_error: "Required" }).min(1, "Required").max(10),
});

module.exports = {
  coinSchema,
};
