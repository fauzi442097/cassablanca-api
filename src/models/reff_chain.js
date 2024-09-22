const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reff_chain', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    chain_nm: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    confirm_cnt: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'reff_chain',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "reff_chain_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
