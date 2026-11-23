// servicios/gateway/src/server.js — API Gateway (puerto 4000: el único público)
// Recibe todo lo de afuera y lo reenvía al core. Notificaciones y pagos NO aparecen aquí:
// lo que el gateway no reenvía, desde afuera no existe.
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

const CORE = process.env.CORE_URL ?? 'http://localhost:4001';
const NOTIFICACIONES = process.env.NOTIFICACIONES_URL ?? 'http://localhost:4002';
const PAGOS = process.env.PAGOS_URL ?? 'http://localhost:4003';

const app = express();
app.use(morgan('dev'));

// OJO: aquí NO va express.json(). Un proxy reenvía el cuerpo tal cual llega; si lo lee
// antes, al core le llega una petición sin cuerpo (paso 7)
const haciaCore = createProxyMiddleware({
	target: CORE,
	changeOrigin: true,
	pathFilter: ['/api', '/socket.io', '/imagenes', '/cliente.html', '/admin.html'], // lo público
});
app.use(haciaCore);

// Reto 1: La salud del sistema
async function consultarSalud(url) {
	const r = await fetch(`${url}/salud`, { signal: AbortSignal.timeout(2000) });
	if (!r.ok) throw new Error(`HTTP ${r.status}`);
	return 'ok';
}

app.get('/salud', async (req, res) => {
	const [core, notificaciones, pagos] = await Promise.allSettled([
		consultarSalud(CORE),
		consultarSalud(NOTIFICACIONES),
		consultarSalud(PAGOS),
	]);

	const servicios = {
		core: core.status === 'fulfilled' ? 'ok' : 'caido',
		notificaciones: notificaciones.status === 'fulfilled' ? 'ok' : 'caido',
		pagos: pagos.status === 'fulfilled' ? 'ok' : 'caido',
	};

	const todosOk = Object.values(servicios).every((s) => s === 'ok');
	res.status(todosOk ? 200 : 503).json({ gateway: 'ok', servicios });
});

app.get('/', (req, res) => res.json({ gateway: 'CampusEats', reenvia_a: CORE }));
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada en el gateway' }));

const PUERTO = process.env.PORT ?? 4000;
const servidor = app.listen(PUERTO, (error) => {
	if (error) throw error; // Express 5: si el puerto está ocupado, el error llega aquí
	console.log(`Gateway en http://localhost:${PUERTO} → core en ${CORE}`);
});
// El "upgrade" a WebSocket no pasa por Express: hay que entregárselo al proxy a mano.
// Sin esta línea, Socket.IO se queda en polling (o no conecta si pide solo websocket)
servidor.on('upgrade', haciaCore.upgrade);
