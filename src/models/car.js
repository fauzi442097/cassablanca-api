const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('car', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    make: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    year: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    price: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'car',
    schema: 'public',
    timestamps: false
  });
};
