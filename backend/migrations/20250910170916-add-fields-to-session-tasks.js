'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('SessionTasks', 'description', 'title');
    await queryInterface.addColumn('SessionTasks', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('SessionTasks', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending',
    });
    await queryInterface.addColumn('SessionTasks', 'tags', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('SessionTasks', 'observations', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('SessionTasks', 'title', 'description');
    await queryInterface.removeColumn('SessionTasks', 'description');
    await queryInterface.removeColumn('SessionTasks', 'status');
    await queryInterface.removeColumn('SessionTasks', 'tags');
    await queryInterface.removeColumn('SessionTasks', 'observations');
  }
};
