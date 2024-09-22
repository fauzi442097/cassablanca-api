const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reff_bonus_status', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    bonus_status_nm: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'reff_bonus_status',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "reff_bonus_status_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
