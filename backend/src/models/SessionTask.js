'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SessionTask extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SessionTask.belongsTo(models.WorkSession, {
        foreignKey: 'workSessionId',
        as: 'workSession',
      });
    }
  }
  SessionTask.init({
    description: DataTypes.TEXT,
    workSessionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SessionTask',
  });
  return SessionTask;
};