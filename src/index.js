import express from 'express';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { config } from './config.js';

const app = express();
app.use(express.json());

app.use('/', authRoutes);       // /register, /login
app.use('/user', userRoutes);   // /user/*

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.listen(config.port, () => {
  console.log(`🚀 Servidor en http://localhost:${config.port}`);
});