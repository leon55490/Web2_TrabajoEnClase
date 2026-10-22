// servidor.js — API CRUD de productos con http nativo
import http from 'node:http';

// "Base de datos" en memoria: se pierde al reiniciar el proceso
let productos = [
	{ id: 1, nombre: 'Almuerzo del día', precio: 12000, stock: 25 },
	{ id: 2, nombre: 'Jugo natural', precio: 4000, stock: 50 },
	{ id: 3, nombre: 'Café campesino', precio: 2500, stock: 100 },
];
let siguienteId = 4;

// --- Ayudantes: lo que un framework haría por nosotros ---

// Responder JSON con el código de estado indicado
function responderJson(res, codigo, datos) {
	res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' });
	res.end(JSON.stringify(datos));
}

// Leer el body: llega en pedazos (chunks) por un stream
function leerBody(req) {
	return new Promise((resolve, reject) => {
		let cuerpo = '';
		req.on('data', (pedazo) => {
			cuerpo += pedazo;
		});
		req.on('end', () => {
			if (cuerpo === '') return resolve(null);
			try {
				resolve(JSON.parse(cuerpo));
			} catch {
				reject(new Error('JSON inválido'));
			}
		});
		req.on('error', reject);
	});
}

// --- El servidor: un gran enrutador manual ---
const servidor = http.createServer(async (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const partes = url.pathname.split('/').filter(Boolean); // '/api/productos/2' → ['api','productos','2']

	// Solo atendemos /api/productos
	if (partes[0] !== 'api' || partes[1] !== 'productos') {
		return responderJson(res, 404, { error: 'Ruta no encontrada' });
	}

	const id = partes[2] ? Number(partes[2]) : null;

	try {
		// GET /api/productos → listar todos
		// GET /api/productos
		if (req.method === 'GET' && id === null) {
			const disponibles = url.searchParams.get('disponibles');

			if (disponibles === 'true') {
				const filtrados = productos.filter((p) => p.stock > 0);

				return responderJson(res, 200, filtrados);
			} else if (disponibles === 'false') {
				return responderJson(res, 200, filtrados);
			}

			return responderJson(res, 200, productos);
		}

		// GET /api/productos/:id → ver uno
		if (req.method === 'GET') {
			const producto = productos.find((p) => p.id === id);
			if (!producto) return responderJson(res, 404, { error: 'Producto no encontrado' });
			return responderJson(res, 200, producto);
		}

		// POST /api/productos → crear
		if (req.method === 'POST' && id === null) {
			const body = await leerBody(req);
			if (!body || !body.nombre || typeof body.precio !== 'number') {
				return responderJson(res, 400, {
					error: 'nombre y precio (número) son obligatorios',
				});
			}
			const nuevo = {
				id: siguienteId++,
				nombre: body.nombre,
				precio: body.precio,
				stock: body.stock ?? 0,
			};
			productos.push(nuevo);
			return responderJson(res, 201, nuevo); // 201: recurso creado
		}

		// PUT /api/productos/:id → actualizar
		if (req.method === 'PUT' && id !== null) {
			const producto = productos.find((p) => p.id === id);
			if (!producto) return responderJson(res, 404, { error: 'Producto no encontrado' });
			const body = await leerBody(req);
			if (!body) return responderJson(res, 400, { error: 'Body requerido' });
			// Actualizamos solo los campos permitidos
			if (body.nombre !== undefined) producto.nombre = body.nombre;
			if (body.precio !== undefined) producto.precio = body.precio;
			if (body.stock !== undefined) producto.stock = body.stock;
			return responderJson(res, 200, producto);
		}

		// DELETE /api/productos/:id → eliminar
		if (req.method === 'DELETE' && id !== null) {
			const existe = productos.some((p) => p.id === id);
			if (!existe) return responderJson(res, 404, { error: 'Producto no encontrado' });
			productos = productos.filter((p) => p.id !== id);
			return responderJson(res, 204, null); // 204: sin contenido
		}

		// Método no soportado en esta ruta
		return responderJson(res, 405, { error: `Método ${req.method} no permitido` });
	} catch (error) {
		// JSON malformado u otro error inesperado
		const codigo = error.message === 'JSON inválido' ? 400 : 500;
		return responderJson(res, codigo, { error: error.message });
	}
});

servidor.listen(3000, () => {
	console.log('CampusEats (nativo) en http://localhost:3000');
});
