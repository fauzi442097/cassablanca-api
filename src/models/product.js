const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "product",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      curr_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "reff_curr",
          key: "id",
        },
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        comment: "USDT",
      },
      sharing_pct_usdt: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      sharing_pct_product: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "product",
      schema: "public",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "product_pk",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
