const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "ranking",
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      ranking_nm: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      direct_bonus: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      ranking_bonus: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      global_bonus: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      lvl: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "ranking",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "ranking_pk",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
