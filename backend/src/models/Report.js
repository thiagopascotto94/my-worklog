'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Report.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
      Report.hasMany(models.ReportItem, { foreignKey: 'reportId', as: 'items' });
      Report.belongsTo(models.ClientContact, { foreignKey: 'approvedBy', as: 'approver' });
    }
  }
  Report.init({
    userId: DataTypes.INTEGER,
    clientId: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    totalAmount: DataTypes.DECIMAL,
    status: DataTypes.STRING,
    hourlyRate: DataTypes.DECIMAL(10, 2),
    shareToken: DataTypes.STRING,
    approvedAt: DataTypes.DATE,
    approvedBy: DataTypes.INTEGER,
    rejectionReason: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};