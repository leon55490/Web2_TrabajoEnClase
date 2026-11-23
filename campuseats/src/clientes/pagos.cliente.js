// src/clientes/pagos.cliente.js — el core le pide al servicio de pagos que cobre.
// Mismo patrón que notificaciones.cliente.js (URL del .env, token interno, timeout),
// con una diferencia: aquí SÍ esperamos la respuesta, porque sin cobro no hay venta.
const BASE = process.env.PAGOS_URL ?? 'http://localhost:4003';

export async function cobrar({ monto, referencia }) {
	const respuesta = await fetch(`${BASE}/pagos/cobrar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-servicio-token': process.env.TOKEN_INTERNO ?? '',
		},
		body: JSON.stringify({ monto, referencia }),
		signal: AbortSignal.timeout(5000), // una pasarela puede tardar, pero no para siempre
	});

	const datos = await respuesta.json();
	// 402 no es un fallo: la pasarela funcionó y el banco dijo que no
	if (respuesta.status === 402) return { aprobado: false, motivo: datos.motivo };
	if (!respuesta.ok) throw new Error(`pagos respondió ${respuesta.status}`);
	return { aprobado: true, transaccionId: datos.transaccionId };
}

// Reto 2: Devolver la plata si el pedido no se pudo crear después del cobro
export async function reembolsar(transaccionId) {
	const respuesta = await fetch(`${BASE}/pagos/reembolsar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-servicio-token': process.env.TOKEN_INTERNO ?? '',
		},
		body: JSON.stringify({ transaccionId }),
		signal: AbortSignal.timeout(5000),
	});

	if (!respuesta.ok) throw new Error(`pagos respondió ${respuesta.status}`);
	return respuesta.json();
}
