const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('wallet', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    coin_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'coin',
        key: 'id'
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'wallet',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "wallet_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
