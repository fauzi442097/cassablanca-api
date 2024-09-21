const {
  requestOTPService,
  verifyOTPService,
} = require("../services/auth-service");
const { tryCatch } = require("../utils/helper");
const Response = require("../utils/response-handler");

const requestOTP = tryCatch(async (req, res) => {
  const email = req.body.email;
  if (!email) return Response.BadRequest(res, "Email wajib diisi");
  await requestOTPService(email);
  return Response.Success(res, null, "Kode OTP berhasil dikirim ke Email Anda");
});

const verifyOTP = tryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return Response.BadRequest(res, "Email dan OTP wajib diisi");
  }

  const token = await verifyOTPService(email, otp);
  return Response.Success(res, { token });
});

module.exports = {
  requestOTP,
  verifyOTP,
};
