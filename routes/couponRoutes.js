const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { Op } = require('sequelize');

// Obtener todos los cuponessz
router.get('/cupones', async (req, res) => {
    try {
        const cupones = await Coupon.findAll();
        res.json(cupones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los cupones', error: error.message });
    }
});

// Obtener un cupón por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const cupon = await Coupon.findByPk(id);
        if (cupon) {
            res.json(cupon);
        } else {
            res.status(404).json({ message: "Cupón no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar el cupón', error: error.message });
    }
});

// Crear un nuevo cupón con validaciones
router.post('/create', async (req, res) => {
    const { porcentaje, codigo, fecha_expiracion, usos_maximos, usos_actuales } = req.body;
    try {
        // Validar que el código del cupón sea único
        const existingCoupon = await Coupon.findOne({ where: { codigo } });
        if (existingCoupon) {
            return res.status(400).json({ message: 'El código del cupón ya existe' });
        }

        // Validar que la fecha de expiración no sea en el pasado
        const today = new Date();
        if (new Date(fecha_expiracion) <= today) {
            return res.status(400).json({ message: 'La fecha de expiración debe ser en el futuro' });
        }

        const newCoupon = await Coupon.create({
            porcentaje,
            codigo,
            fecha_expiracion,
            usos_maximos,
            usos_actuales: usos_actuales || 0
        });

        res.status(201).json(newCoupon);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el cupón', error: error.message });
    }
});

// Actualizar un cupón por su ID con validaciones
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { fecha_expiracion, usos_actuales, usos_maximos } = req.body;

    try {
        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }

        // Validar que no se excedan los usos máximos
        if (usos_actuales > usos_maximos) {
            return res.status(400).json({ message: 'Los usos actuales no pueden exceder los usos máximos' });
        }

        // Validar que la fecha de expiración no sea en el pasado
        if (fecha_expiracion && new Date(fecha_expiracion) <= new Date()) {
            return res.status(400).json({ message: 'La fecha de expiración debe ser en el futuro' });
        }

        const updatedCoupon = await coupon.update(req.body);
        res.json(updatedCoupon);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el cupón', error: error.message });
    }
});

// Eliminar un cupón
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Coupon.destroy({ where: { idcupon: id } });
        if (deleted) {
            res.json({ message: 'Cupón eliminado' });
        } else {
            res.status(404).json({ message: 'Cupón no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el cupón', error: error.message });
    }
});

/// Obtener cupones disponibles
router.get('/disponibles', async (req, res) => {
    try {
        const today = new Date();
        const cuponesDisponibles = await Coupon.findAll({
            where: {
                fecha_expiracion: {
                    [Op.gt]: today, // No expirados
                },
                usos_actuales: {
                    [Op.lt]: sequelize.col('usos_maximos'), // Aún no agotados
                },
            },
        });
        res.json(cuponesDisponibles);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cupones disponibles', error: error.message });
    }
});



// Ruta para consumir un cupón durante una compra
router.post('/usar-cupon/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const coupon = await Coupon.findByPk(id);

        if (!coupon) {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }

        // Verificar si el cupón ya alcanzó el límite de usos
        if (coupon.usos_actuales >= coupon.usos_maximos) {
            return res.status(400).json({ message: 'Se alcanzó el límite de uso del cupón' });
        }

        // Incrementar el contador de usos
        coupon.usos_actuales += 1;

        await coupon.save();

        res.status(200).json({
            message: 'Cupón consumido exitosamente',
            usos_actuales: coupon.usos_actuales,
            usos_maximos: coupon.usos_maximos,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al consumir el cupón', error: error.message });
    }
});



module.exports = router;
