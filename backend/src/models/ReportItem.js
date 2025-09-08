'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReportItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ReportItem.belongsTo(models.Report, { foreignKey: 'reportId' });
      ReportItem.belongsTo(models.WorkSession, { foreignKey: 'workSessionId' });
    }
  }
  ReportItem.init({
    reportId: DataTypes.INTEGER,
    workSessionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ReportItem',
  });
  return ReportItem;
};