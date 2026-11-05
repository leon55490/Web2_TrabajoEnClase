// experimentos/lab-n1.mjs — el problema N+1, contado en el log de consultas.
// Uso (desde la raíz del proyecto, con pedidos creados): node experimentos/lab-n1.mjs
import { prisma } from '../src/db.js';

console.log('--- VERSIÓN A: un findUnique por cada pedido ---');
const pedidos = await prisma.pedido.findMany({ take: 5, orderBy: { id: 'asc' } });
for (const p of pedidos) {
	const u = await prisma.usuario.findUnique({ where: { id: p.usuarioId } });
	console.log(`pedido ${p.id} → ${u.nombre}`);
}

console.log('--- VERSIÓN B: include ---');
const conUsuario = await prisma.pedido.findMany({
	take: 5,
	orderBy: { id: 'asc' },
	include: { usuario: { select: { nombre: true } } },
});
conUsuario.forEach((p) => console.log(`pedido ${p.id} → ${p.usuario.nombre}`));

await prisma.$disconnect();
