const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('coin', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    curr_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'reff_curr',
        key: 'id'
      }
    },
    chain_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'reff_chain',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'coin',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "coin_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
