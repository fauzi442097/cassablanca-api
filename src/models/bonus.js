const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bonus', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    member_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "member yang dapat bonus",
      references: {
        model: 'member',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL,
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
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    bonus_status_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'reff_bonus_status',
        key: 'id'
      }
    },
    realized_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'bonus',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "bonus_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
