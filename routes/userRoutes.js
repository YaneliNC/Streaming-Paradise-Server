const express = require('express');
const { User } = require('../models');
const bcrypt = require('bcryptjs'); // Para encriptar y comparar contraseñas
const jwt = require('jsonwebtoken'); // Para manejar JWT
const auth = require('../middleware/auth'); // Importar el middleware de autenticación
const router = express.Router();
const crypto = require('crypto');



router.post('/register', async (req, res) => {
  try {
    const users = req.body; // Suponiendo que recibes un arreglo de usuarios en el body

    // Validar que sea un arreglo
    if (!Array.isArray(users)) {
      return res.status(400).json({ message: 'El formato del body debe ser un arreglo de usuarios' });
    }

    const createdUsers = [];

    for (const userData of users) {
      const { name, email, password, age, country, favoriteGenre, genero, idrol } = userData;

      // Verificar si el email ya está registrado
      let existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        continue; // Saltar al siguiente usuario si el email ya existe
      }

      // Crear el nuevo usuario
      const newUser = await User.create({
        name,
        email,
        password, // El hook beforeCreate encriptará la contraseña
        age,
        country,
        favoriteGenre,
        genero: genero || 'No especificado', // Valor predeterminado
        idrol
      });

      createdUsers.push(newUser);
    }

    res.status(201).json({ message: 'Usuarios registrados exitosamente', createdUsers });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ error: error.message });
  }
});



// Iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Buscar al usuario por correo
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
          return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

      // Generar remember_token
      const rememberToken = crypto.randomBytes(64).toString('hex');
      user.remember_token = rememberToken;

      // Guardar el usuario actualizado
      const updatedUser = await user.save();

      // Respuesta con todos los datos del usuario
      res.status(200).json({
          message: 'Inicio de sesión exitoso',
          user: { 
              id: updatedUser.id,            // ID del usuario
              name: updatedUser.name,        // Nombre del usuario
              email: updatedUser.email,      // Correo electrónico
              age: updatedUser.age,          // Edad
              country: updatedUser.country,  // País
              favoriteGenre: updatedUser.favoriteGenre, // Género favorito
              genero: updatedUser.genero,    // Género
              idrol: updatedUser.idrol       // ID del rol
          },
          rememberToken: updatedUser.remember_token // Token de recuerdo
      });

  } catch (error) {
      console.error('Error al iniciar sesión', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});



// Cerrar sesión (Logout)
router.post('/logout', async (req, res) => {
  const { rememberToken } = req.body;
  try {
    const user = await User.findOne({ remember_token: rememberToken });
    if (user) {
      user.remember_token = null;
      await user.save();
    }
    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error al cerrar sesión', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener todos los usuarios (No protegida)
router.get('/user', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener datos del perfil del usuario autenticado (Protegido con JWT)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT para actualizar un usuario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, age, country, favoriteGenre, genero, idrol } = req.body;

  try {
    const userToUpdate = await User.findByPk(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar los campos solo si están presentes en el cuerpo de la solicitud
    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email;
    if (password) userToUpdate.password = password; // La contraseña se encriptará en el hook de Sequelize
    if (age) userToUpdate.age = age;
    if (country) userToUpdate.country = country;
    if (favoriteGenre) userToUpdate.favoriteGenre = favoriteGenre;
    if (genero) userToUpdate.genero = genero;
    if (idrol) userToUpdate.idrol = idrol;

    await userToUpdate.save();
    res.status(200).json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
});


// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id; // Obtener el ID del parámetro de la URL
    const user = await User.findByPk(userId); // Usar findByPk para encontrar el usuario por ID

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user); // Devolver el usuario encontrado
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Método DELETE para eliminar un usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const userToDelete = await User.findByPk(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await userToDelete.destroy(); // Elimina el usuario de la base de datos
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
});


module.exports = router;
