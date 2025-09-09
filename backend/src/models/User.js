'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Client, {
        foreignKey: 'userId',
        as: 'clients',
      });
      User.hasMany(models.WorkSession, {
        foreignKey: 'userId',
        as: 'workSessions',
      });
      User.hasMany(models.Report, {
        foreignKey: 'userId',
        as: 'reports',
      });
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email_confirmed: DataTypes.BOOLEAN,
    failed_login_attempts: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};