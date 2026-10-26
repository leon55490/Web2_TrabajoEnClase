// src/app.js — configura Express (sin arrancarlo)
import express from 'express';
import morgan from 'morgan';
import productosRouter from './routes/productos.routes.js';
import usuariosRouter from './routes/usuarios.routes.js';
import pedidosRouter from './routes/pedidos.routes.js';
import authRouter from './routes/auth.routes.js';
import { manejadorErrores } from './middlewares/errores.js';

const app = express();

app.use(morgan('dev'));

app.use((req, res, next) => {
	if (process.env.MANTENIMIENTO === 'true') {
		return res.status(503).json({ error: 'En mantenimiento' });
	}
	next();
});

app.use(express.json());

app.get('/', (req, res) => res.json({ nombre: 'CampusEats API', version: '1.0' }));
app.use('/api/productos', productosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/auth', authRouter);

// 404 para todo lo demás (va al final)
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(manejadorErrores);

export default app;
