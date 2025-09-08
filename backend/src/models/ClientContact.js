'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClientContact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ClientContact.belongsTo(models.Client, {
        foreignKey: 'clientId',
        as: 'client',
      });
    }
  }
  ClientContact.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    approval_key: DataTypes.STRING,
    clientId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ClientContact',
  });
  return ClientContact;
};