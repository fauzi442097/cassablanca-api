const { tryCatch } = require("../utils/helper");

const orderService = require("../services/order-service");
const Response = require("../utils/response-handler");

const confirmPayment = tryCatch(async (req, res) => {
  const data = req.body;
  data.member_id = req.user.id;
  await orderService.confirmPaymentMember(data);
  return Response.Success(
    res,
    null,
    "Payment confirmed successfully! Please wait while the transaction is being verified."
  );
});

module.exports = {
  confirmPayment,
};
