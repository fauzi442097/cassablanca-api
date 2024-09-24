const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_balance', {
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    curr_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    balance: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
      comment: "Saldonya"
    }
  }, {
    sequelize,
    tableName: 'users_balance',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "users_balance_pk",
        unique: true,
        fields: [
          { name: "user_id" },
          { name: "curr_id" },
        ]
      },
    ]
  });
};
