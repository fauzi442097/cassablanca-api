var DataTypes = require("sequelize").DataTypes;
var _car = require("./car");
var _person = require("./person");

function initModels(sequelize) {
  var car = _car(sequelize, DataTypes);
  var person = _person(sequelize, DataTypes);


  return {
    car,
    person,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
