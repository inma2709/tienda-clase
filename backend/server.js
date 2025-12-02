import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Productosrouter from './routes/productos.routes.js';
import pool from './config/db.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());



// 👉 Aquí montas el router
app.use('/api/productos', Productosrouter);

// Arrancar el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
