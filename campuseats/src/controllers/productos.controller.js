// src/controllers/productos.controller.js
// Capa de presentación: traduce HTTP ↔ negocio.
import * as servicio from '../services/productos.service.js';
export async function listar(req, res, next) {
	try {
		const productos = await servicio.listar({
			disponibles: req.query.disponibles === 'true',
			buscar: req.query.buscar,
		});
		res.json(productos);
	} catch (error) {
		next(error);
	}
}

export async function obtener(req, res, next) {
	try {
		const producto = await servicio.buscarPorId(Number(req.params.id));
		res.json(producto);
	} catch (error) {
		next(error);
	}
}

export async function crearProducto(req, res, next) {
	try {
		const nuevo = await servicio.crear({
			...req.body,
			imagenUrl: req.file ? `/imagenes/productos/${req.file.filename}` : undefined,
		});
		res.status(201).json(nuevo);
	} catch (error) {
		next(error);
	}
}

export async function actualizar(req, res, next) {
	try {
		const producto = await servicio.actualizar(Number(req.params.id), {
			...req.body,
			...(req.file
				? { imagenUrl: `/imagenes/productos/${req.file.filename}` }
				: {}),
		});
		res.json(producto);
	} catch (error) {
		next(error);
	}
}

export async function subirFoto(req, res, next) {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'Adjunta un archivo en el campo "imagen"' });
		}
		const producto = await servicio.cambiarImagen(
			Number(req.params.id),
			`/imagenes/productos/${req.file.filename}`
		);
		res.json(producto);
	} catch (error) {
		next(error);
	}
}

export async function ajustarStock(req, res, next) {
	try {
		const producto = await servicio.ajustarStock(
			Number(req.params.id),
			Number(req.body.delta)
		);
		res.json(producto);
	} catch (error) {
		next(error);
	}
}

export async function eliminar(req, res, next) {
	try {
		await servicio.eliminar(Number(req.params.id));
		res.status(204).end();
	} catch (error) {
		next(error);
	}
}
