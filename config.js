const { Sequelize } = require('sequelize');
require('dotenv').config(); // Cargar variables de entorno

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Este parámetro es importante para las conexiones en Render
        }
    },
    retry: {
        max: 3, // Número de intentos
        match: [
            /ECONNRESET/,
            /ETIMEDOUT/,
            /ECONNREFUSED/
        ]
    }
});

module.exports = sequelize;

