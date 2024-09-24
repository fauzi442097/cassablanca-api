const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reff_wallet_type', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    wallet_type_nm: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'reff_wallet_type',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "reff_wallet_type_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
