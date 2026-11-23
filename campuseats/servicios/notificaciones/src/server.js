// servicios/notificaciones/src/server.js — microservicio de notificaciones (puerto 4002)
// Hace lo que antes hacían email.service.js y sms/ dentro del core. Nada más.
import 'dotenv/config';
import express from 'express';
import { enviarConfirmacionPedido } from './email.service.js'; // el código de la semana 9, movido
import { enviarSms } from './sms/index.js';                    // ídem

const app = express();
app.use(express.json());

// ¿Estás vivo? Sin token: lo consultan el gateway y, la otra semana, Docker
app.get('/salud', (req, res) => res.json({ servicio: 'notificaciones', ok: true }));

// Seguridad entre servicios: un secreto compartido. Nadie de afuera ordena correos
app.use((req, res, next) => {
	if (req.headers['x-servicio-token'] !== process.env.TOKEN_INTERNO) {
		return res.status(401).json({ error: 'Servicio no autorizado' });
	}
	next();
});

// 202 Accepted: "recibí la orden y la voy a procesar". Se responde ANTES de enviar:
// el core no tiene por qué esperar a que Ethereal o Twilio contesten
app.post('/notificaciones/email-pedido', (req, res) => {
	const { destinatario, pedido } = req.body ?? {};
	if (!destinatario || !pedido?.items) {
		return res.status(400).json({ error: 'destinatario y pedido son obligatorios' });
	}
	res.status(202).json({ aceptado: true });
	enviarConfirmacionPedido(destinatario, pedido).catch((err) => {
		console.error('No se pudo enviar el email de confirmación:', err.message || err.code);
	});
});

app.post('/notificaciones/sms', (req, res) => {
	const { telefono, mensaje } = req.body ?? {};
	if (!telefono || !mensaje) {
		return res.status(400).json({ error: 'telefono y mensaje son obligatorios' });
	}
	res.status(202).json({ aceptado: true });
	enviarSms(telefono, mensaje).catch((err) => console.error('No se pudo enviar el SMS:', err.message));
});

const PUERTO = process.env.PORT ?? 4002;
app.listen(PUERTO, (error) => {
	if (error) throw error; // Express 5: si el puerto está ocupado, el error llega aquí
	console.log(`Notificaciones en http://localhost:${PUERTO}`);
});
