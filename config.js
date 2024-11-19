const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('content_platform', 'root', 'Yaneli18062003', {
    host: 'localhost',
    dialect: 'mysql', 
});

module.exports = sequelize;
