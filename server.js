const express = require('express');
const cors = require('cors');
const sequelize = require('./config'); // Importar configuración de Sequelize
require('dotenv').config();

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const chartsRoutes = require('./routes/chartsRoutes');
const videoRoutes = require('./routes/videoRoutes');
const commentRoutes = require('./routes/commentRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const couponRoutes = require('./routes/couponRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const offerRoutes = require('./routes/offerRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const rolePermissionRoutes = require('./routes/rolePermissionRoutes');
const contactRoutes = require('./routes/contact');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Verificar conexión a la base de datos
sequelize
  .authenticate()
  .then(() => {
    console.log('Conexión con la base de datos establecida.');
    return sequelize.sync(); // Sincronizar modelos
  })
  .then(() => {
    console.log('Modelos sincronizados correctamente.');
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });

// Habilitar CORS
app.use(cors({ origin: '*', credentials: true }));

// Middlewares
app.use(express.json());

// Rutas
app.use('/users', userRoutes);
app.use('/videos', videoRoutes);
app.use('/comments', commentRoutes);
app.use('/ratings', ratingRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/coupons', couponRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/offers', offerRoutes);
app.use('/roles', roleRoutes);
app.use('/permissions', permissionRoutes);
app.use('/role-permission', rolePermissionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/payments', paymentRoutes);
app.use(contactRoutes)

// Graficas Yaneli
app.use(chartsRoutes);


// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
