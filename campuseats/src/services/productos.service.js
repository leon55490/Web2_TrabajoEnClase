// src/services/productos.service.js
// Capa de negocio: reglas del dominio. NO conoce req, res ni códigos HTTP.
import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

export function listar({ disponibles, buscar } = {}) {
	return prisma.producto.findMany({
		where: {
			...(disponibles ? { stock: { gt: 0 } } : {}),
			...(buscar ? { nombre: { contains: buscar, mode: 'insensitive' } } : {}),
		},
		orderBy: { id: 'asc' },
	});
}

export async function buscarPorId(id) {
	const producto = await prisma.producto.findUnique({ where: { id } });
	if (!producto) throw noEncontrado('Producto no encontrado');
	return producto;
}

export async function crear({
	nombre,
	precio,
	stock = 0,
	descripcion,
	categoria,
	disponible,
	imagenUrl,
}) {
	const duplicado = await prisma.producto.findUnique({ where: { nombre } });
	if (duplicado) {
		throw conflicto(`Ya existe un producto llamado "${nombre}"`);
	}
	return prisma.producto.create({
		data: { nombre, precio, stock, descripcion, categoria, disponible, imagenUrl },
	});
}

export async function actualizar(id, cambios) {
	await buscarPorId(id);
	return prisma.producto.update({ where: { id }, data: cambios });
}

// La imagen se actualiza mediante una operación propia para no perderla
// al reutilizar la actualización de campos del producto.
export async function cambiarImagen(id, imagenUrl) {
	await buscarPorId(id);
	return prisma.producto.update({
		where: { id },
		data: { imagenUrl },
	});
}

export async function ajustarStock(id, delta) {
	const { count } = await prisma.producto.updateMany({
		where: { id, stock: { gte: -delta } },
		data: { stock: { increment: delta } },
	});
	if (count === 0) {
		const producto = await buscarPorId(id);
		throw conflicto(`Stock insuficiente: hay ${producto.stock} y se piden ${-delta}`);
	}
	return buscarPorId(id);
}

export async function eliminar(id) {
	await buscarPorId(id);
	await prisma.producto.delete({ where: { id } });
}
