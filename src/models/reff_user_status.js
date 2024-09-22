const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reff_user_status', {
    id: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true
    },
    user_status_nm: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'reff_user_status',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "reff_member_status_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
