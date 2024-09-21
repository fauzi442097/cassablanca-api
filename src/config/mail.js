const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "jayden.gibson29@ethereal.email",
    pass: "HSFHCUd5cPqp1SsY1j",
  },
});

module.exports = transporter;
