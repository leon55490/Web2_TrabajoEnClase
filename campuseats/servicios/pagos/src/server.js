// servicios/pagos/src/server.js — pasarela de pagos SIMULADA (puerto 4003)
// Imita a una real (Wompi, Mercado Pago, Stripe): recibe un cobro y responde aprobado o rechazado.
import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

app.get('/salud', (req, res) => res.json({ servicio: 'pagos', ok: true }));

// Igual que notificaciones: solo el core puede ordenar cobros
app.use((req, res, next) => {
	if (req.headers['x-servicio-token'] !== process.env.TOKEN_INTERNO) {
		return res.status(401).json({ error: 'Servicio no autorizado' });
	}
	next();
});

const CUPO = 100000; // regla de la simulación: cobros de más de $100.000 se rechazan
const transacciones = new Map(); // en memoria: se pierden al reiniciar (es una simulación)
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

app.post('/pagos/cobrar', async (req, res) => {
	const { monto, referencia } = req.body ?? {};
	if (!Number.isInteger(monto) || monto <= 0 || !referencia) {
		return res.status(400).json({ error: 'monto (entero positivo) y referencia son obligatorios' });
	}

	await esperar(Number(process.env.LATENCIA_MS ?? 300)); // la red y el banco tardan

	if (monto > CUPO) {
		console.log(`💳 RECHAZADO ${referencia}: $${monto}`);
		// 402 Payment Required: el cobro se procesó y el banco dijo que no (no es un fallo del servicio)
		return res.status(402).json({ estado: 'RECHAZADO', referencia, motivo: 'Cupo insuficiente (simulado)' });
	}

	const transaccionId = `tx-${Date.now()}`;
	transacciones.set(transaccionId, { monto, referencia, estado: 'APROBADO' });
	console.log(`💳 APROBADO ${referencia}: $${monto} → ${transaccionId}`);
	res.json({ estado: 'APROBADO', referencia, transaccionId });
});

// Para el reto 2: devolver la plata si el pedido no se pudo crear
app.post('/pagos/reembolsar', (req, res) => {
	const tx = transacciones.get(req.body?.transaccionId);
	if (!tx) return res.status(404).json({ error: 'Transacción no encontrada' });
	if (tx.estado === 'REEMBOLSADO') return res.status(409).json({ error: 'Ya estaba reembolsada' });

	tx.estado = 'REEMBOLSADO';
	console.log(`↩️ REEMBOLSADO ${req.body.transaccionId}: $${tx.monto}`);
	res.json({ estado: 'REEMBOLSADO', transaccionId: req.body.transaccionId });
});

const PUERTO = process.env.PORT ?? 4003;
app.listen(PUERTO, (error) => {
	if (error) throw error; // Express 5: si el puerto está ocupado, el error llega aquí
	console.log(`Pagos (simulado) en http://localhost:${PUERTO}`);
});
