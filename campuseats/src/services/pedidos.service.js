// src/services/pedidos.service.js
// Capa de negocio de pedidos. NO conoce req, res ni códigos HTTP.
import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

// Qué relaciones acompañan a un pedido al leerlo.
// El usuario va SIEMPRE con select: el passwordHash nunca sale en una respuesta.
const conDetalle = {
	usuario: { select: { id: true, nombre: true, email: true } },
	items: { include: { producto: { select: { id: true, nombre: true } } } },
};

export async function obtenerPedido(id) {
	const pedido = await prisma.pedido.findUnique({ where: { id }, include: conDetalle });
	if (!pedido) throw noEncontrado('Pedido no encontrado');
	return pedido;
}

// GET /api/pedidos?estado=RECIBIDO&pagina=2&porPagina=10&desde=2026-10-01
export async function listarPedidos({ estado, pagina, porPagina, desde }) {
	const where = {
		estado: estado || undefined, // undefined = "sin filtro" (el truco del paso 10 de la semana 6)
		creadoEn: desde ? { gte: new Date(desde) } : undefined,
	};

	// Dos consultas independientes → en paralelo: la página y el total
	const [datos, total] = await Promise.all([
		prisma.pedido.findMany({
			where,
			orderBy: { creadoEn: 'desc' },
			skip: (pagina - 1) * porPagina, // cuántos saltar
			take: porPagina, // cuántos traer
			include: { usuario: { select: { nombre: true } }, items: true },
		}),
		prisma.pedido.count({ where }),
	]);

	return {
		datos,
		paginacion: { pagina, porPagina, total, totalPaginas: Math.ceil(total / porPagina) },
	};
}

// items llega como [{ productoId: 1, cantidad: 2 }, ...]
export async function crearPedido(usuarioId, items) {
	// $transaction con una función: todo lo que use "tx" se confirma junto o no se confirma
	return prisma.$transaction(async (tx) => {
		const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
		if (!usuario) throw noEncontrado(`Usuario ${usuarioId} no existe`);

		let total = 0;
		const itemsParaCrear = [];

		for (const item of items) {
			const producto = await tx.producto.findUnique({ where: { id: item.productoId } });
			if (!producto) throw noEncontrado(`Producto ${item.productoId} no existe`);
			// La condición viaja DENTRO del UPDATE (el patrón del paso 8 de la semana 6):
			// la base revisa y descuenta en un solo paso, aunque lleguen 20 pedidos a la vez
			const { count } = await tx.producto.updateMany({
				where: { id: producto.id, stock: { gte: item.cantidad } },
				data: { stock: { decrement: item.cantidad } },
			});
			if (count === 0) {
				// Este throw aborta la transacción completa: ROLLBACK automático
				throw conflicto(`Stock insuficiente de "${producto.nombre}": se piden ${item.cantidad}`);
			}

			total += producto.precio * item.cantidad; // el precio sale de la base, nunca del request
			itemsParaCrear.push({
				productoId: producto.id,
				cantidad: item.cantidad,
				precioUnitario: producto.precio, // se congela el precio de hoy
			});
		}

		// El pedido y sus items en una sola escritura anidada
		return tx.pedido.create({
			data: { usuarioId, total, items: { create: itemsParaCrear } },
			include: { items: true },
		});
	});
}

// Regla de negocio: un pedido ENTREGADO o CANCELADO ya no cambia
const ESTADOS_FINALES = ['ENTREGADO', 'CANCELADO'];

export async function cambiarEstado(id, estado) {
	const pedido = await prisma.pedido.findUnique({ where: { id } });
	if (!pedido) throw noEncontrado('Pedido no encontrado');
	if (ESTADOS_FINALES.includes(pedido.estado)) {
		throw conflicto(`Un pedido ${pedido.estado} ya no puede cambiar de estado`);
	}
	return prisma.pedido.update({ where: { id }, data: { estado } });
}

