const { tryCatch } = require("../utils/helper");
const Response = require("../utils/response-handler");

const getAll = tryCatch(async (req, res) => {
  return Response.Success(res, []);
});

module.exports = {
  getAll,
};
