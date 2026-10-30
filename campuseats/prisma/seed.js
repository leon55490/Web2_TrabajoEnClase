// Datos de arranque de CampusEats. Se puede ejecutar varias veces.
import bcrypt from 'bcrypt';
import { prisma } from '../src/db.js';

async function main() {
	const passwordAdmin = await bcrypt.hash('Admin123!', 10);
	const passwordCliente = await bcrypt.hash('Cliente123!', 10);

	await prisma.usuario.upsert({
		where: { email: 'admin@campuseats.co' },
		update: { passwordHash: passwordAdmin, rol: 'ADMIN', telefono: null },
		create: {
			nombre: 'Admin Cafetería',
			email: 'admin@campuseats.co',
			passwordHash: passwordAdmin,
			rol: 'ADMIN',
		},
	});

	await prisma.usuario.upsert({
		where: { email: 'ana@ucaldas.edu.co' },
		update: {
			passwordHash: passwordCliente,
			rol: 'CLIENTE',
			telefono: '+573001234567',
		},
		create: {
			nombre: 'Ana Estudiante',
			email: 'ana@ucaldas.edu.co',
			telefono: '+573001234567',
			passwordHash: passwordCliente,
			rol: 'CLIENTE',
		},
	});

	const productos = [
		{ nombre: 'Almuerzo del día', precio: 12000, stock: 25, categoria: 'Almuerzos' },
		{ nombre: 'Jugo natural', precio: 4000, stock: 50, categoria: 'Bebidas' },
		{ nombre: 'Café campesino', precio: 2500, stock: 100, categoria: 'Bebidas' },
		{ nombre: 'Empanada', precio: 2000, stock: 40, categoria: 'Snacks' },
		{ nombre: 'Sandwich de pollo', precio: 9500, stock: 15, categoria: 'Almuerzos' },
	];

	for (const producto of productos) {
		await prisma.producto.upsert({
			where: { nombre: producto.nombre },
			update: {
				precio: producto.precio,
				stock: producto.stock,
				categoria: producto.categoria,
			},
			create: producto,
		});
	}

	console.log('Seed completado: 2 usuarios y 5 productos');
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
