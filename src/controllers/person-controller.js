const logger = require("../config/logging");
const { getPersons, getPersonById } = require("../services/person-service");
const { tryCatch } = require("../utils/helper");
const Response = require("../utils/response-handler");

const index = tryCatch(async (req, res) => {
  const { page, size, search } = req.query;
  const persons = await getPersons(parseInt(page), parseInt(size), search);
  return Response.Success(res, persons);
});

const getById = async (req, res) => {
  try {
    const personId = req.params.personId;
    const persons = await getPersonById(personId);
    res.json({
      rc: 200,
      rm: "Sukses",
      data: persons,
    });
  } catch (e) {
    res.status(500).json({
      rc: 500,
      rm: e.message,
    });
  }
};

module.exports = {
  index,
  getById,
};
