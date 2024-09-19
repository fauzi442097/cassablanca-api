const logger = require("../config/logging");
const { getPersons, getPersonById } = require("../services/person-service");

const index = async (req, res) => {
  try {
    const persons = await getPersons();
    logger.info("Success retrieving data customers", {
      request: {
        method: req.method,
        url: req.path,
        ip: req.ip,
        body: req.body,
        query: req.query,
        header: req.headers,
      },
      response: {
        rc: 200,
        rm: "Sukses",
      },
    });

    res.json({
      rc: 200,
      rm: "Sukses",
      data: persons,
    });
  } catch (err) {
    res.status(500).json({
      rc: 500,
      rm: err.message,
    });
  }
};

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
