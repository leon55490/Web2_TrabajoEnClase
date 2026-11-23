// src/clientes/notificaciones.cliente.js — el core ya no envía correos ni SMS:
// le PIDE al servicio de notificaciones que lo haga, por HTTP.
// Las funciones se llaman IGUAL y reciben LO MISMO que las de la semana 9:
// por eso pedidos.service.js solo cambia sus import.
const BASE = process.env.NOTIFICACIONES_URL ?? 'http://localhost:4002';

async function pedir(ruta, cuerpo) {
	const respuesta = await fetch(`${BASE}${ruta}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-servicio-token': process.env.TOKEN_INTERNO ?? '', // el secreto compartido
		},
		body: JSON.stringify(cuerpo),
		signal: AbortSignal.timeout(3000), // la red puede no contestar nunca: 3 s y se aborta
	});

	if (!respuesta.ok) throw new Error(`notificaciones respondió ${respuesta.status}`);
	return respuesta.json();
}

export function enviarConfirmacionPedido(destinatario, pedido) {
	return pedir('/notificaciones/email-pedido', { destinatario, pedido });
}

export function enviarSms(telefono, mensaje) {
	return pedir('/notificaciones/sms', { telefono, mensaje });
}
