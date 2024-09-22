const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
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
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'product',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "product_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
