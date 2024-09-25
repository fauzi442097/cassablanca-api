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
  const { otp } = req.body;
  const { token, user } = await authService.verifyOTPService(otp);
  const responseData = { user, token };
  return Response.Success(res, responseData);
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

const getUser = async (req, res) => {
  const { userId } = req.params;
  const data = await authService.getCurrentUserLogin(userId);
  if (!data) return Response.NotFound(res, "User tidak ditemukan");
  return Response.Success(res, data);
};

module.exports = {
  requestOTP,
  verifyOTP,
  signUp,
  getUser,
};
