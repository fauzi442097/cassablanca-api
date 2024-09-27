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
    "Konfirmasi pembayaran berhasil. Silakan tunggu sampai transaksi selesai diverifikasi"
  );
});

module.exports = {
  confirmPayment,
};
