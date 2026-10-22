// hola-servidor.js — el servidor mínimo
import http from 'node:http';

const servidor = http.createServer((req, res) => {
	// req.method y req.url son los datos crudos de la petición
	console.log(`${req.method} ${req.url}`);

	if (req.url === '/' && req.method === 'GET') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ mensaje: 'CampusEats API viva' }));
		return;
	}

	if (req.url === '/menu' && req.method === 'GET') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(
			JSON.stringify([
				{ nombre: 'Almuerzo del día', precio: 12000 },
				{ nombre: 'Jugo natural', precio: 4000 },
			])
		);
		return;
	}

	// Cualquier otra ruta: 404
	res.writeHead(404, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

servidor.listen(3000, () => {
	console.log('Servidor escuchando en http://localhost:3000');
});
