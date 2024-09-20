const Response = require("../utils/response-handler");
const jwt = require("jsonwebtoken");


const checkToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return Response.Unauthorized(res, "Unauthorized. Token is missing");
  }

  const token = authHeader.split(" ")[1]; // Extract token from the 'Bearer <token>' format
  if (!token) {
    return Response.Unauthorized(res, "Unauthorized. Token is missing");
  }

  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Jika token telah kedaluwarsa atau tidak valid
      if (err.name === "TokenExpiredError") {
        return Response.Unauthorized(res, "Unauthorized. Token expired");
      }

      return Response.Unauthorized(res, "Unauthorized. Token is invalid");
    }

    req.user = user; // Attach user info to request
    next();
  });
};

const authenticateJWT = (req, res, next) => {
  if (req.path === "/api/login" || req.path === "/api/register") {
    next(); // Skip authentication for login and register routes
  } else {
    return checkToken(req, res, next); // Apply authentication for other routes
  }
};

module.exports = authenticateJWT;
