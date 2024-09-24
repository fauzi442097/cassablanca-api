const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reff_withdrawal_status', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    withdrawal_status_nm: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'reff_withdrawal_status',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "reff_withdrawal_status_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
