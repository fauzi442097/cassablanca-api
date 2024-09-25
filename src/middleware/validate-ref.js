const Response = require("../utils/response-handler");
const { ZodError } = require("zod");

const {
  userStatusSchema,
  withdrawalStatusSchema,
  walletTypeSchema,
  withBonusStatusSchema,
  currencySchema,
} = require("../validation/referensi-validation");

const validateRef = (req, res, next) => {
  try {
    const { ref_name } = req.params;
    switch (ref_name) {
      case "user-status":
        userStatusSchema.parse(req.body);
        break;
      case "wallet-type":
        walletTypeSchema.parse(req.body);
        break;
      case "withdrawal-status":
        withdrawalStatusSchema.parse(req.body);
        break;
      case "bonus-status":
        withBonusStatusSchema.parse(req.body);
        break;
      case "currency":
        currencySchema.parse(req.body);
        break;
    }

    next();
  } catch (e) {
    if (e instanceof ZodError) {
      const validationErrors = e.errors.reduce((acc, curr) => {
        const key = curr.path.join(".");
        const errorMessage = curr.message;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(errorMessage);
        return acc;
      }, {});

      return Response.BadRequest(res, "Invalid data", validationErrors);
    } else {
      return Response.Error(res);
    }
  }
};

module.exports = validateRef;
