const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reff_ranking_req_type', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    ranking_req_type_nm: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'reff_ranking_req_type',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "reff_ranking_req_type_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
