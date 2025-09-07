require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.local') });

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || 'database_development.sqlite'
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:'
  },
  production: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || '/path/to/production/database.sqlite'
  }
};
