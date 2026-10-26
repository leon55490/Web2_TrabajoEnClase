// src/controllers/pedidos.controller.js — traduce HTTP ↔ negocio (mismo patrón de productos)
import * as servicio from '../services/pedidos.service.js';

export async function crear(req, res, next) {
	try {
		const pedido = await servicio.crearPedido(req.usuario.id, req.body.items);
		res.status(201).json(pedido);
	} catch (error) {
		next(error);
	}
}

export async function listar(req, res, next) {
	try {
		const resultado = await servicio.listarPedidos({
			estado: req.query.estado,
			pagina: Number(req.query.pagina) || 1, // los query params llegan como texto
			porPagina: Number(req.query.porPagina) || 10,
			desde: req.query.desde,
		});
		res.json(resultado);
	} catch (error) {
		next(error);
	}
}

export async function obtener(req, res, next) {
	try {
		const pedido = await servicio.obtenerPedido(Number(req.params.id));
		res.json(pedido);
	} catch (error) {
		next(error); // el 404 lo lanza el service
	}
}

export async function cambiarEstado(req, res, next) {
	try {
		const pedido = await servicio.cambiarEstado(Number(req.params.id), req.body.estado);
		res.json(pedido);
	} catch (error) {
		next(error);
	}
}


