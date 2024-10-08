const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "users",
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
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      photo_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      old_user_status_id: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "users",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "users_pk",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
