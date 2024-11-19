const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); 
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

// Configurar conexión con la base de datos
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
});

// Verificar conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conexión con la base de datos establecida.');
  }
});

// Habilitar CORS para aceptar solicitudes desde cualquier origen
app.use(cors({
  origin: '*',
  credentials: true,
}));

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
app.use(contactRoutes);

// Graficas Yaneli
app.use(chartsRoutes);

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
