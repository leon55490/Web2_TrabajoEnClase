// src/services/reportes.service.js — reporte de ventas del día (Semana 7 · Paso 9)
import { prisma } from '../db.js';

export async function ventasDelDia() {
	const inicio = new Date();
	inicio.setHours(0, 0, 0, 0);

	const where = {
		creadoEn: { gte: inicio },
		estado: { not: 'CANCELADO' },
	};

	const [agregados, porProducto] = await Promise.all([
		prisma.pedido.aggregate({
			_sum: { total: true },
			_count: true,
			where,
		}),
		prisma.pedidoItem.groupBy({
			by: ['productoId'],
			_sum: { cantidad: true },
			where: { pedido: where },
		}),
	]);

	const ids = porProducto.map((p) => p.productoId);
	const productos = ids.length
		? await prisma.producto.findMany({
				where: { id: { in: ids } },
				select: { id: true, nombre: true },
			})
		: [];

	const nombresPorId = new Map(productos.map((p) => [p.id, p.nombre]));

	const unidadesPorProducto = porProducto.map((item) => ({
		productoId: item.productoId,
		nombre: nombresPorId.get(item.productoId) ?? 'Desconocido',
		unidades: item._sum.cantidad ?? 0,
	}));

	return {
		fecha: inicio.toISOString().slice(0, 10),
		totalVendido: agregados._sum.total ?? 0,
		pedidos: agregados._count,
		unidadesPorProducto,
	};
}
