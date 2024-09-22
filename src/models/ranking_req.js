const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ranking_req', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ranking_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'ranking',
        key: 'id'
      }
    },
    ranking_req_type_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'reff_ranking_req_type',
        key: 'id'
      }
    },
    ranking_id_member: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'ranking',
        key: 'id'
      }
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    curr_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'reff_curr',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'ranking_req',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "ranking_req_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
