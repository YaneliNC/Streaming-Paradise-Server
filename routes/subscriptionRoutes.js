const express = require('express');
const { Subscription } = require('../models'); // Elimina User
const router = express.Router();
const { Op } = require('sequelize');

// // Crear una nueva suscripción (POST)
// router.post('/nuevasub', async (req, res) => {
//   try {
//     const { startDate, endDate, nombre, precio, descripcion, descuento, p_final } = req.body;

//     const subscription = await Subscription.create({
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       nombre,
//       precio,
//       descripcion,
//       descuento,
//       p_final,
//       isActive: true,
//     });

//     res.status(201).json(subscription);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

router.post('/nuevasub', async (req, res) => {
  try {
    const subscriptions = req.body; // Obtener el arreglo de suscripciones desde el body

    // Validar que cada suscripción tenga los campos requeridos
    const createdSubscriptions = [];
    for (let subscription of subscriptions) {
      const { startDate, endDate, nombre, precio, descripcion, descuento = 0, p_final } = subscription;

      // Validar que los valores numéricos son válidos
      if (precio < 0 || descuento < 0 || p_final < 0 || !nombre || !descripcion) {
        return res.status(400).json({ message: 'Valores inválidos o campos faltantes en una de las suscripciones' });
      }

      // Crear la suscripción
      const newSubscription = await Subscription.create({
        idsub: subscription.idsub, // Si necesitas asignar un idsub manualmente
        nombre,
        precio,
        descripcion,
        descuento,
        p_final,
        isActive: subscription.isActive,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

      createdSubscriptions.push(newSubscription);
    }

    // Responder con las suscripciones creadas
    res.status(201).json({ message: 'Suscripciones creadas exitosamente', subscriptions: createdSubscriptions });
  } catch (error) {
    console.error("Error al crear suscripciones:", error);
    res.status(400).json({ error: error.message });
  }
});



// Obtener todas las suscripciones (GET) - Ruta con nombre
router.get('/all', async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll();

    res.json(subscriptions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.put('/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { startDate, endDate, nombre, precio, descripcion, descuento, p_final, isActive } = req.body;

    // Buscar la suscripción por ID
    const subscription = await Subscription.findByPk(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada.' });
    }

    // Actualizar los campos de la suscripción
    subscription.startDate = new Date(startDate);
    subscription.endDate = new Date(endDate);
    subscription.nombre = nombre;
    subscription.precio = precio;
    subscription.descripcion = descripcion;
    subscription.descuento = descuento;
    subscription.p_final = p_final;
    subscription.isActive = isActive;

    // Guardar los cambios en la base de datos
    await subscription.save();

    res.status(200).json({ message: 'Suscripción actualizada correctamente.', subscription });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancelar una suscripción (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Subscription.destroy({
      where: { idsub: id }, 
    });

    if (result) {
      res.json({ message: 'Suscripción eliminada correctamente.' });
    } else {
      res.status(404).json({ message: 'Suscripción no encontrada.' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener la suscripción actual (GET) por ID de suscripción
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Cambiado a "id" para coincidir con el parámetro
    const subscription = await Subscription.findOne({
      where: { idsub: id },
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No se encontró una suscripción activa.' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



module.exports = router;
