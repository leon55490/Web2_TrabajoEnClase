import http from 'node:http';

http
	.createServer(async (req, res) => {
		if (req.url === '/pesado') {
			// Cálculo de CPU: NO se puede delegar, corre en el único hilo de JS
			await new Promise((r) => setTimeout(r, 5000));
			res.end('listo ');
		} else {
			res.end('rápido');
		}
	})
	.listen(3000, () => console.log('http://localhost:3000'));
