const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const User = require('../models/User');
const Video = require('../models/Video');
const sequelize = require('../config');

// Crear una reseña (cambia el endpoint a '/')
router.post('/', async (req, res) => {
  try {
    const { idvideo, iduser, comentario } = req.body;

    // Crear el nuevo comentario
    const newComment = await Comment.create({
      idvideo,
      iduser,
      comentario,
      fecha: new Date(), // Guardar la fecha actual
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las reseñas
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [
        { model: User, attributes: ['name'] },  // Incluir el nombre del usuario
        { model: Video, attributes: ['title'] },  // Incluir el título del video
      ],
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener reseñas de un video específico
router.get('/video/:idvideo', async (req, res) => {
  try {
    const { idvideo } = req.params;

    const comments = await Comment.findAll({
      where: { idvideo },
      include: [{ model: User, attributes: ['name'] }], // Incluir el nombre del usuario
    });

    if (comments.length === 0) {
      return res.status(404).json({ message: 'No hay reseñas para este video' });
    }

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una reseña por su ID
router.put('/:idcoment', async (req, res) => {
  try {
    const { idcoment } = req.params;
    const { comentario, clasificacion } = req.body;

    const updatedComment = await Comment.update(
      { comentario, clasificacion },
      { where: { idcoment } }
    );

    if (updatedComment[0] === 0) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json({ message: 'Reseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una reseña por su ID
router.delete('/:idcoment', async (req, res) => {
  try {
    const { idcoment } = req.params;

    const deletedComment = await Comment.destroy({ where: { idcoment } });

    if (!deletedComment) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/miscomentarios/:creatorId', async (req, res) => {
  try {
    // Obtener el creatorId de los parámetros de la solicitud
    const creatorId = req.params.creatorId;

    // Ejecutar la consulta SQL con el creatorId proporcionado
    const results = await sequelize.query(
      `SELECT 
          v."idvideo",       -- Asegúrate de usar comillas dobles para columnas con camelCase
          v."title",         -- Lo mismo aquí para el título
          r."idcoment",
          r."comentario",
          r."fecha",
          r."iduser" AS "id_usuario_comentador",  
          COALESCE(u."name", 'Desconocido') AS "nombre_usuario_comentador"  -- Usamos COALESCE para reemplazar NULL con 'Desconocido'
       FROM 
          "videos" v
       LEFT JOIN 
          "reseña" r ON v."idvideo" = r."idvideo"
       LEFT JOIN 
          "users" u ON r."iduser" = u."id"    
       WHERE 
          v."creatorId" = :creatorId
       ORDER BY 
          v."idvideo", r."fecha" DESC`,
      {
        replacements: { creatorId },  // Paso del creatorId de manera segura
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);  // Enviar los resultados como respuesta en JSON
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ message: error.message });  // Manejo de errores
  }
});


// Ruta para obtener las calificaciones de los videos de un creador específico
router.get('/miscalificaciones/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const results = await sequelize.query(
      `SELECT 
          v."idvideo", 
          v."title", 
          r."fecha", 
          ra."score" AS "calificacion", 
           COALESCE(u."name", 'Desconocido') AS "nombre_usuario_calificador"  -- Usamos COALESCE para reemplazar NULL con 'Desconocido'
       FROM 
          "videos" v
       LEFT JOIN 
          "reseña" r ON v."idvideo" = r."idvideo"
       LEFT JOIN 
          "ratings" ra ON v."idvideo" = ra."idvideo"
       LEFT JOIN 
          "users" u ON ra."iduser" = u."id"
       WHERE 
          v."creatorId" = :creatorId
       ORDER BY 
          v."idvideo", r."fecha" DESC`,
      {
        replacements: { creatorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener el top 5 de personas que más han visto los videos
router.get('/top-interacciones/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const results = await sequelize.query(
      `SELECT 
          u."name" AS "nombre_usuario", 
          COUNT(DISTINCT r."idvideo") + COUNT(DISTINCT ra."idvideo") AS "total_interacciones"
      FROM 
          "users" u
      LEFT JOIN 
          "reseña" r ON u."id" = r."iduser"
      LEFT JOIN 
          "ratings" ra ON u."id" = ra."iduser"
      LEFT JOIN 
          "videos" v ON v."idvideo" = r."idvideo" OR v."idvideo" = ra."idvideo"
      WHERE 
          v."creatorId" = :creatorId
      GROUP BY 
          u."id"
      ORDER BY 
          "total_interacciones" DESC
      LIMIT 5`,
      {
        replacements: { creatorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (error) {
    console.error('Error al obtener las interacciones:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener cuántos usuarios de cada género han visto los videos
router.get('/usergenero/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    // Consulta para obtener el conteo de usuarios por género que han visto los videos
    const results = await sequelize.query(
      `SELECT 
          u."genero" AS "genero_usuario", 
          COUNT(DISTINCT u."id") AS "usuarios_que_vieron"
      FROM 
          "videos" v
      LEFT JOIN 
          "reseña" r ON v."idvideo" = r."idvideo"
      LEFT JOIN 
          "users" u ON r."iduser" = u."id"
      WHERE 
          v."creatorId" = :creatorId 
          AND u."genero" IN ('Masculino', 'Femenino')  -- Filtramos para incluir solo los géneros Masculino y Femenino
      GROUP BY 
          u."genero"
      ORDER BY 
          "usuarios_que_vieron" DESC`,  // Ordenamos por el número de usuarios que han visto los videos
      {
        replacements: { creatorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Log de los resultados para depuración
    console.log(results);

    // Responder con los resultados
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los géneros:', error);
    res.status(500).json({ message: error.message });
  }
});




// Ruta para obtener el porcentaje de los países que más han visto los videos
router.get('/userpais/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const results = await sequelize.query(
      `SELECT 
          u."country" AS "pais", 
          COUNT(DISTINCT u."id") AS "usuarios_unicos", 
          ROUND((COUNT(DISTINCT u."id") * 100.0 / 
                 (SELECT COUNT(DISTINCT r."iduser") 
                  FROM "reseña" r
                  JOIN "videos" v ON r."idvideo" = v."idvideo"
                  WHERE v."creatorId" = :creatorId)), 2) AS "porcentaje_usuarios"
      FROM "videos" v
      JOIN "reseña" r ON v."idvideo" = r."idvideo"
      JOIN "users" u ON r."iduser" = u."id"
      WHERE v."creatorId" = :creatorId
      GROUP BY u."country"
      ORDER BY "porcentaje_usuarios" DESC`,
      {
        replacements: { creatorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (error) {
    console.error('Error al obtener los paises:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener las visualizaciones totales de los videos
router.get('/views/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const results = await sequelize.query(
      `SELECT 
          SUM(v."views") AS "total_visualizaciones"
      FROM "videos" v
      WHERE v."creatorId" = :creatorId`,
      {
        replacements: { creatorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (error) {
    console.error('Error al obtener las views:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener el total de usuarios que han interactuado
router.get('/users/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const results = await sequelize.query(
      `SELECT COUNT(DISTINCT u."id") AS "total_usuarios"
      FROM "users" u
      LEFT JOIN "reseña" r ON u."id" = r."iduser"
      LEFT JOIN "ratings" rt ON u."id" = rt."iduser"
      LEFT JOIN "videos" v ON (r."idvideo" = v."idvideo" OR rt."idvideo" = v."idvideo")
      WHERE v."creatorId" = :creatorId
      OR r."idvideo" IN (SELECT "idvideo" FROM "videos" WHERE "creatorId" = :creatorId)
      OR rt."idvideo" IN (SELECT "idvideo" FROM "videos" WHERE "creatorId" = :creatorId)`,
      {
        replacements: { creatorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (error) {
    console.error('Error al obtener las views:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener el género de los videos más vistos
router.get('/generovideo/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const results = await sequelize.query(
      `SELECT 
          v."genero" AS "genero_video", 
          SUM(v."views") AS "total_vistas", 
          ROUND((SUM(v."views") * 100.0 / 
                 (SELECT SUM("views") 
                  FROM "videos" 
                  WHERE "creatorId" = :creatorId)), 2) AS "porcentaje_vistas"
      FROM "videos" v
      WHERE v."creatorId" = :creatorId
      GROUP BY v."genero"
      ORDER BY "porcentaje_vistas" DESC`,
      {
        replacements: { creatorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (error) {
    console.error('Error al obtener los generos:', error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;