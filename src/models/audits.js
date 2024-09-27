const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "audits",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      event: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      auditable_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      auditable_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      old_values: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      new_values: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.INET,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.STRING(1023),
        allowNull: true,
      },
      tags: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "audits",
      schema: "public",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "audits_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
