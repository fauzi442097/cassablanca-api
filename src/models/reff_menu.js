const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reff_menu', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    menu_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    menu_identity: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'reff_menu',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "ref_menu_parent_id_idx",
        fields: [
          { name: "parent_id" },
        ]
      },
      {
        name: "ref_menu_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
