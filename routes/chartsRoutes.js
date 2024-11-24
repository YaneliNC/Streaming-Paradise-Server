// routes/chartsRoutes.js
const express = require('express');
const router = express.Router();
const Charts = require('../models/Charts');

// Ruta para obtener el conteo de usuarios por género
router.get('/usuarios-genero', async (req, res) => {
    try {
      const results = await Charts.sequelize.query(
        `SELECT genero, COUNT(*) AS cantidad 
         FROM users 
         WHERE genero IN ('Masculino', 'Femenino') 
         GROUP BY genero`,
        { type: Charts.sequelize.QueryTypes.SELECT }
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Ruta para obtener el conteo de usuarios por rango de edad
  router.get('/usuarios-rango-edad', async (req, res) => {
    try {
      const results = await Charts.sequelize.query(
        `SELECT CASE 
            WHEN age BETWEEN 15 AND 18 THEN '15-18' 
            WHEN age BETWEEN 19 AND 30 THEN '19-30' 
            WHEN age BETWEEN 31 AND 50 THEN '31-50' 
            WHEN age BETWEEN 51 AND 60 THEN '51-60' 
            ELSE '60+' 
          END AS rango_edad, 
          COUNT(*) AS cantidad_usuarios 
         FROM users 
         GROUP BY rango_edad 
         ORDER BY rango_edad`,
        { type: Charts.sequelize.QueryTypes.SELECT }
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Ruta para obtener el top 5 de países con mayor cantidad de usuarios
  router.get('/usuarios-top-paises', async (req, res) => {
    try {
      const results = await Charts.sequelize.query(
        `SELECT country, COUNT(*) AS cantidad_usuarios 
         FROM users 
         GROUP BY country 
         ORDER BY cantidad_usuarios DESC 
         LIMIT 5`,
        { type: Charts.sequelize.QueryTypes.SELECT }
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Ruta para obtener el idsub con mayor cantidad de compras y su nombre
  router.get('/top-idsub-compras', async (req, res) => {
    try {
      const results = await Charts.sequelize.query(
        `SELECT c.idsub, s.nombre AS nombre_sub, COUNT(*) AS cantidad_compras 
         FROM compra AS c 
         JOIN subscriptions AS s ON c.idsub = s.idsub 
         GROUP BY c.idsub, s.nombre 
         ORDER BY cantidad_compras DESC 
         LIMIT 1`,
        { type: Charts.sequelize.QueryTypes.SELECT }
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Ruta para obtener el top 3 de géneros favoritos más vistos
  router.get('/top-generos-favoritos', async (req, res) => {
    try {
      const results = await Charts.sequelize.query(
        `SELECT favoriteGenre, COUNT(*) AS cantidad_vistos 
         FROM users 
         WHERE favoriteGenre IS NOT NULL 
         GROUP BY favoriteGenre 
         ORDER BY cantidad_vistos DESC 
         LIMIT 3`,
        { type: Charts.sequelize.QueryTypes.SELECT }
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// Ruta para obtener el total de usuarios
router.get('/total-usuarios', async (req, res) => {
  try {
    const results = await Charts.sequelize.query(
      `
      SELECT COUNT(*)::INTEGER AS total_usuarios 
      FROM users
      `,
      { type: Charts.sequelize.QueryTypes.SELECT }
    );

    res.json(results[0]); // Enviar el resultado como JSON
  } catch (error) {
    console.error('Error al obtener el total de usuarios:', error);
    res.status(500).json({ message: 'Error al obtener el total de usuarios' });
  }
});

  
  // Ruta para obtener el total de compras por mes en los últimos 6 meses
  router.get('/total-compras', async (req, res) => {
    try {
      const results = await Charts.sequelize.query(
        `SELECT TO_CHAR(fecha, 'YYYY-MM') AS mes, 
                SUM(total) AS total_ventas 
         FROM compra 
         WHERE fecha >= NOW() - INTERVAL '6 MONTH' 
         GROUP BY mes 
         ORDER BY mes ASC`,
        { type: Charts.sequelize.QueryTypes.SELECT }
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
module.exports = router;
