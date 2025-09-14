'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SessionTasks', 'continuedFromTaskId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'SessionTasks',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('SessionTasks', 'continuedFromTaskId');
  }
};
