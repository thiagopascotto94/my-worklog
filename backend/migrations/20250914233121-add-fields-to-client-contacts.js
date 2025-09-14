'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ClientContacts', 'celular', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('ClientContacts', 'isWhatsapp', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('ClientContacts', 'allowAproveReport', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ClientContacts', 'celular');
    await queryInterface.removeColumn('ClientContacts', 'isWhatsapp');
    await queryInterface.removeColumn('ClientContacts', 'allowAproveReport');
  }
};
