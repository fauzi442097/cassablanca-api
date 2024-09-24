const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('withdrawal', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    coin_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'coin',
        key: 'id'
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    user_id_admin: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    withdrawal_status_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    chain_trx_id: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'withdrawal',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "withdrawal_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
