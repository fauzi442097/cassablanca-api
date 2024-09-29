const { z } = require("zod");

const idMembersSchema = z.object({
  id_members: z.array(z.number().int().positive()),
});

module.exports = {
  idMembersSchema,
};
