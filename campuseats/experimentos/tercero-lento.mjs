// experimentos/tercero-lento.mjs — una "API de tasas" que tarda 10 segundos en responder (paso 6)
// Uso: node experimentos/tercero-lento.mjs (déjalo corriendo en otra terminal)
// y en src/services/tasas.service.js cambia URL_TASAS por 'http://localhost:4001/lento'
import http from 'node:http';

http
	.createServer((req, res) => {
		console.log(`${new Date().toLocaleTimeString()} · llegó ${req.url}: respondo en 10 s…`);
		setTimeout(() => {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ rates: { COP: 4000 } }));
		}, 10_000);
	})
	.listen(4001, () =>
		console.log('Tercero lento en http://localhost:4001 (Ctrl+C para detenerlo)')
	);
