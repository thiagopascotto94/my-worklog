'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Clients', 'cnpj', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'inscricaoEstadual', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'cep', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'logradouro', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'numero', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'complemento', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'bairro', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'municipio', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'uf', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'telefone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Clients', 'cnpj');
    await queryInterface.removeColumn('Clients', 'inscricaoEstadual');
    await queryInterface.removeColumn('Clients', 'cep');
    await queryInterface.removeColumn('Clients', 'logradouro');
    await queryInterface.removeColumn('Clients', 'numero');
    await queryInterface.removeColumn('Clients', 'complemento');
    await queryInterface.removeColumn('Clients', 'bairro');
    await queryInterface.removeColumn('Clients', 'municipio');
    await queryInterface.removeColumn('Clients', 'uf');
    await queryInterface.removeColumn('Clients', 'telefone');
  }
};
