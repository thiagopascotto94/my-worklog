'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WorkSession.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      WorkSession.belongsTo(models.Client, {
        foreignKey: 'clientId',
        as: 'client',
      });
      WorkSession.hasMany(models.SessionTask, {
        foreignKey: 'workSessionId',
        as: 'tasks',
      });
      WorkSession.hasOne(models.ReportItem, {
        foreignKey: 'workSessionId',
      });
    }
  }
  WorkSession.init({
    userId: DataTypes.INTEGER,
    clientId: DataTypes.INTEGER,
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    status: DataTypes.STRING,
    totalPausedSeconds: DataTypes.INTEGER,
    lastPausedTime: DataTypes.DATE,
    hourlyRate: DataTypes.DECIMAL,
    tags: DataTypes.TEXT,
    totalEarned: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'WorkSession',
  });
  return WorkSession;
};