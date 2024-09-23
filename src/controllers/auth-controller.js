const { tryCatch } = require("../utils/helper");
const Response = require("../utils/response-handler");

const authService = require("../services/auth-service");

const requestOTP = tryCatch(async (req, res) => {
  const email = req.body.email;
  if (!email) return Response.BadRequest(res, "Email wajib diisi");
  await authService.requestOTPService(email);
  return Response.Success(res, null, "Kode OTP berhasil dikirim ke Email Anda");
});

const verifyOTP = tryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return Response.BadRequest(res, "Email dan OTP wajib diisi");
  }

  const token = await authService.verifyOTPService(email, otp);
  return Response.Success(res, { token });
});

const signUp = tryCatch(async (req, res) => {
  const data = req.body;
  await authService.registerMemberByReferalCode(data);
  return Response.Success(
    res,
    null,
    "Pendaftaran akun berhasil. Silakan login menggunakan otp yang sudah dikirimkan ke email"
  );
});

module.exports = {
  requestOTP,
  verifyOTP,
  signUp,
};
