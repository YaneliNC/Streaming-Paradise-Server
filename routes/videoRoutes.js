const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Video = require('../models/Video');
const User = require('../models/User');

// Crear un nuevo video.
router.post('/create', async (req, res) => {
  try {
    const { title, url, creatorId, descripcion, genero } = req.body;

    // Crear el nuevo video
    const newVideo = await Video.create({
      title,
      url,
      creatorId,
      descripcion,
      genero
    });

    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener todos los videos con el nombre del creador
router.get('/catalogo', async (req, res) => {
  try {
    const videos = await Video.findAll({
      include: {
        model: User,
        as: 'creator',
        attributes: ['name']  // Traemos solo el campo 'name' del creador
      }
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los videos o filtrar por género excluyendo el video actual
router.get('/', async (req, res) => {
  try {
    const { genero, excludeId } = req.query; // Obtener género y ID a excluir

    // Filtro condicional basado en el género y excluyendo el video actual
    const videos = await Video.findAll({
      where: {
        ...(genero ? { genero } : {}),
        ...(excludeId ? { idvideo: { [Op.ne]: parseInt(excludeId) } } : {}), // Asegurarse de que excludeId sea un número
      },
    });

    res.json(videos);
  } catch (error) {
    console.error("Error al obtener videos:", error); // Registrar el error en el servidor
    res.status(500).json({ error: error.message });
  }
});


// Endpoint para obtener los géneros únicos
router.get('/genres', async (req, res) => {
  try {
    const genres = await Video.findAll({
      attributes: ['genero'],
      group: ['genero']
    });

    const genreList = genres.map(genre => genre.genero);
    res.json(genreList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Obtener un video por su ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el video en la base de datos usando idvideo
    const video = await Video.findOne({ where: { idvideo: id } });

    if (!video) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un video por su ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, creatorId, descripcion, genero } = req.body;

    // Actualizar el video
    const updatedVideo = await Video.update(
      { title, url, creatorId, descripcion, genero },
      { where: { idvideo: id } }
    );

    if (!updatedVideo || updatedVideo[0] === 0) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }

    res.json({ message: 'Video actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un video por su ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica si el video existe antes de intentar eliminarlo
    const video = await Video.findOne({ where: { idvideo: id } });

    if (!video) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }

    // Si el video existe, procedemos a eliminarlo
    await Video.destroy({ where: { idvideo: id } });

    res.json({ message: 'Video eliminado exitosamente' });
  } catch (error) {
    console.error("Error eliminando el video:", error);
    res.status(500).json({ error: 'Ocurrió un error al intentar eliminar el video' });
  }
});


// Obtener comentarios de un video específico con el nombre del usuario
router.get('/videos/:idvideo', async (req, res) => {
  try {
    const { idvideo } = req.params;

    const comments = await Comment.findAll({
      where: { idvideo },
      include: [
        { model: User, attributes: ['name'] }, // Incluir solo el nombre del usuario
      ],
    });

    if (comments.length === 0) {
      return res.status(404).json({ message: 'No hay comentarios para este video' });
    }

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Incrementar el contador de vistas para un video específico
router.post('/increment-views/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Busca el video en la base de datos usando el campo idvideo
    const video = await Video.findOne({ where: { idvideo: id } });

    if (!video) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }

    // Incrementa el contador de vistas
    video.views += 1;
    await video.save();

    res.status(200).json({ message: 'Visitas incrementadas', views: video.views });
  } catch (error) {
    res.status(500).json({ error: 'Error al incrementar las visitas' });
  }
});

// Obtener todos los videos de un usuario específico
router.get('/user/:creatorId', async (req, res) => {
  try {
    const { creatorId } = req.params;  // Obtener el creatorId desde los parámetros de la ruta

    // Buscar los videos del usuario con el creatorId proporcionado
    const videos = await Video.findAll({
      where: { creatorId: creatorId }  // Filtrar por el creatorId
    });

    if (videos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron videos para este usuario' });
    }

    res.json(videos);  // Devolver los videos encontrados
  } catch (error) {
    res.status(500).json({ error: error.message });  // Manejo de errores
  }
});


module.exports = router;
