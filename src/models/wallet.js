const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "wallet",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      coin_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "coin",
          key: "id",
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      wallet_type_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "reff_wallet_type",
          key: "id",
        },
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expired_otp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      address_temp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "wallet",
      schema: "public",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "wallet_pk",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
