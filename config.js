// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('content_platform', 'root', 'Yaneli18062003', {
//     host: 'localhost',
//     dialect: 'mysql', 
// });

// module.exports = sequelize;

const { Sequelize } = require('sequelize');

// Cargar variables de entorno
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres', // Cambia a 'postgres'
});

module.exports = sequelize;
