const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "orders",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      member_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "member",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "product",
          key: "id",
        },
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        comment: "harga satuan",
      },
      qty: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        comment: "qty * price",
      },
      chain_trx_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Address Tujuan",
      },
      coin_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Coin Id Tujuan",
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expired_otp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      order_sts_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: "reff_order_status",
          key: "id",
        },
      },
    },
    {
      sequelize,
      tableName: "orders",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "orders_pk",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
