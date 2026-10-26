// src/services/auth.service.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { conflicto, ErrorHttp } from '../errores.js';

export async function registrar({ nombre, email, password }) {
	const existe = await prisma.usuario.findUnique({ where: { email } });
	if (existe) throw conflicto('Ya existe una cuenta con ese email');

	const passwordHash = await bcrypt.hash(password, 10);
	const usuario = await prisma.usuario.create({
		data: { nombre, email, passwordHash }, // rol CLIENTE por defecto
		select: { id: true, nombre: true, email: true, rol: true }, // sin hash
	});
	return usuario;
}

export async function login({ email, password }) {
	const usuario = await prisma.usuario.findUnique({ where: { email } });

	// Mismo mensaje si el email no existe o la clave falla:
	// no le regalamos pistas a un atacante sobre qué emails existen
	const credencialesMalas = new ErrorHttp(401, 'Credenciales inválidas');
	if (!usuario) throw credencialesMalas;

	const coincide = await bcrypt.compare(password, usuario.passwordHash);
	if (!coincide) throw credencialesMalas;

	// El token lleva lo mínimo: id (sub) y rol
	const token = jwt.sign({ sub: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRA ?? '4h',
	});

	return {
		token,
		usuario: {
			id: usuario.id,
			nombre: usuario.nombre,
			email: usuario.email,
			rol: usuario.rol,
		},
	};
}
