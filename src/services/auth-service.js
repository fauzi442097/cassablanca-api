const { generateOtp } = require("../utils/helper");

const loginService = async (email) => {
  const otp = generateOtp();

  // Send the OTP email
  //   await sendOtpEmail(email, otp);

  return otp;
};

module.exports = {
  loginService,
};
