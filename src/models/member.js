const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "member",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrong_password_cnt: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_status_id: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        references: {
          model: "reff_user_status",
          key: "id",
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "roles",
          key: "id",
        },
      },
      private_key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expired_otp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ranking_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      member_id_parent: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      referal_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "member",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "member_pk",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
