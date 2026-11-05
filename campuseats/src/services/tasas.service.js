// src/services/tasas.service.js — precio de un producto en dólares
// usando una API pública de tasas de cambio (sin registro ni clave)
const URL_TASAS = 'https://open.er-api.com/v6/latest/USD';

export async function precioEnDolares(precioCop) {
	try {
		// AbortSignal.timeout: si en 3 segundos no responde, abortamos
		const respuesta = await fetch(URL_TASAS, { signal: AbortSignal.timeout(3000) });
		if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`);

		const datos = await respuesta.json();
		const tasaCop = datos.rates?.COP; // pesos por dólar
		// Nunca asumas la forma de una respuesta ajena: si no trae la tasa, es un fallo
		if (typeof tasaCop !== 'number') throw new Error('La respuesta no trae la tasa COP');

		return {
			cop: precioCop,
			usd: Number((precioCop / tasaCop).toFixed(2)),
			tasa: tasaCop,
			fuente: 'open.er-api.com',
		};
	} catch (error) {
		// Si el tercero falla, degradamos con elegancia: la API sigue viva
		console.error('API de tasas no disponible:', error.message);
		return { cop: precioCop, usd: null, tasa: null, fuente: 'no-disponible' };
	}
}
