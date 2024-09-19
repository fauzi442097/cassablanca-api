const express = require("express");
const db = require("./config/database.js");
const logger = require("./config/logging.js");
const routes = require("./routes/index");
const { generateOtp } = require("./utils/otpGenerator.js");
const { sendOtpEmail } = require("./services/otpService.js");

require("dotenv").config(); // Ensure you have dotenv to load environment variables

const app = express();
const port = 3000;
const path = require("path");

app.use("/api", routes);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// Sync models before starting the server
async function startServer() {
  try {
    await db.sync({ force: false }); // Change to { force: true } if needed
    // console.log("Models synchronized successfully!");
    logger.info("Models synchronized successfully!");

    app.listen(port, () => {
      console.log(`Server starting from port: ${port}`);
    });
  } catch (error) {
    console.error("Unable to sync models:", error);
  }
}

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email is required");
  }

  const otp = generateOtp();

  // Send the OTP email
  await sendOtpEmail(email, otp);

  // Here you might want to store the OTP in a database or cache with an expiration time

  res.status(200).send("OTP sent to your email!");
});

startServer();
