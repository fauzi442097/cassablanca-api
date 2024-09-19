const express = require("express");
const logger = require("../config/logging.js");

// Import the required packages
const db = require("../config/database.js");
const DataTypes = require("sequelize").DataTypes;

const initModels = require("../models/init-models.js");
const { Sequelize } = require("sequelize");

const Person = require("../models/person.js")(db, Sequelize.DataTypes);

const persionRoute = require("./person-routes.js");

const router = express.Router();
router.use("/persons", persionRoute);
router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/roles", async (req, res) => {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    const r = await Person.findAll();

    console.log(r);
    res.status(201).json(r);
  } catch (error) {
    logger.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
