const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reff_order_status', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    order_status_nm: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'reff_order_status',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "reff_order_status_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
