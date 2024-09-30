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

      if (roles.length && !roles.includes(user.role_id)) {
        return Response.Forbidden(
          res,
          "Access denied. You are not authorized to perform this action"
        );
      }

      next();
    });
  };
};

module.exports = authorize;
