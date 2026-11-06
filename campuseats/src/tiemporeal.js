// src/tiemporeal.js — servidor Socket.IO con autenticación JWT y salas por usuario
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

export function iniciarTiempoReal(servidorHttp) {
	io = new Server(servidorHttp);

	// Portero de Socket.IO: verifica el mismo token JWT que usa Express
	io.use((socket, next) => {
		const token = socket.handshake.auth?.token;
		if (!token) {
			return next(new Error('Token requerido'));
		}

		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET);
			socket.usuario = { id: payload.sub, rol: payload.rol };
			next();
		} catch {
			return next(new Error('Token inválido o expirado'));
		}
	});

	io.on('connection', (socket) => {
		const { id, rol } = socket.usuario;

		// Cada usuario entra a su propia sala personal: usuario:<id>
		// Así solo el dueño del pedido recibe el evento de su pedido (no todos los conectados)
		socket.join(`usuario:${id}`);

		// Los administradores también entran a la sala de cocina/admin
		if (rol === 'ADMIN') {
			socket.join('admins');
		}

		console.log(`🔌 Socket conectado: usuario ${id} (${rol})`);

		// Reto 1: el cliente le pregunta a la cocina (ping-cocina -> mensaje-cliente en la sala admins)
		// El "de" sale siempre de socket.usuario.id (el token), nunca de lo que envíe el navegador.
		socket.on('ping-cocina', (texto) => {
			if (typeof texto !== 'string') return;
			const mensaje = texto.trim().slice(0, 200);
			if (!mensaje) return;
			io.to('admins').emit('mensaje-cliente', { de: id, mensaje });
		});

		socket.on('disconnect', () => {
			console.log(`🔌 Socket desconectado: usuario ${id}`);
		});
	});

	return io;
}

// Emite un evento únicamente a la sala personal de un usuario (usuario:<id>)
export function notificarUsuario(usuarioId, evento, datos) {
	io?.to(`usuario:${usuarioId}`).emit(evento, datos);
}

// Emite un evento únicamente a la sala de los administradores (admins)
export function notificarAdmins(evento, datos) {
	io?.to('admins').emit(evento, datos);
}
