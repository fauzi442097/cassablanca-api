const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_balance_trx', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    curr_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'reff_curr',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    dbcr: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "0:debet\r\n1:kredit"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users_balance_trx',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "user_balance_trx_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
