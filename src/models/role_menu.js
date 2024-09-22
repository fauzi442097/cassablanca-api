const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('role_menu', {
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'reff_menu',
        key: 'id'
      }
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'role_menu',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "role_menu_pk",
        unique: true,
        fields: [
          { name: "role_id" },
          { name: "menu_id" },
        ]
      },
    ]
  });
};
