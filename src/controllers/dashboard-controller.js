const { tryCatch } = require("../utils/helper");
const Response = require("../utils/response-handler");

const dashboardService = require("../services/dashboard-service");
const { ROLE } = require("../utils/ref-value");

const index = tryCatch(async (req, res) => {
  const roleId = req.user.role_id;
  let data;
  if (roleId == ROLE.MEMBER) {
    data = await dashboardService.getDashboardMember(req);
  } else {
    data = await dashboardService.getDashboardAdmin(req);
  }
  return Response.Success(res, data);
});

module.exports = {
  index,
};
