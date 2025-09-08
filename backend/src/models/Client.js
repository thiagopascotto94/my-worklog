'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Client.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      Client.hasMany(models.ClientContact, {
        foreignKey: 'clientId',
        as: 'contacts',
      });
      Client.hasMany(models.WorkSession, {
        foreignKey: 'clientId',
        as: 'workSessions',
      });
      Client.hasMany(models.Report, {
        foreignKey: 'clientId',
        as: 'reports',
      });
    }
  }
  Client.init({
    name: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Client',
  });
  return Client;
};