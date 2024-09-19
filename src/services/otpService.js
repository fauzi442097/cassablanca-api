const sgMail = require("@sendgrid/mail");

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Store your API key in an environment variable

// Function to send OTP
const sendOtpEmail = async (email, otp) => {
  const msg = {
    to: email, // Recipient email
    from: "your-email@example.com", // Your verified sender email
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    html: `<strong>Your OTP code is ${otp}. It is valid for 5 minutes.</strong>`,
  };

  try {
    await sgMail.send(msg);
    console.log("OTP email sent successfully!");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

module.exports = { sendOtpEmail };
