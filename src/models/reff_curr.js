const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "reff_curr",
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      min_withdrawal: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "reff_curr",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "reff_curr_pk",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
