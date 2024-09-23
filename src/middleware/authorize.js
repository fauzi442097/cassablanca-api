const jwt = require("jsonwebtoken");
const Response = require("../utils/response-handler");

const authorize = (roles = []) => {
  return (req, res, next) => {
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
        if (err.name === "TokenExpiredError") {
          return Response.Unauthorized(res, "Unauthorized. Token expired");
        }

        return Response.Unauthorized(res, "Unauthorized. Token is invalid");
      }

      // Check if the user's role is in the allowed roles
      if (roles.length && !roles.includes(user.role_in)) {
        return Response.Forbidden(res, "Akses tidak diizinkan");
      }

      next();
    });
  };
};

module.exports = authorize;
