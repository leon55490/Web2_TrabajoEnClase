import * as servicio from '../services/auth.service.js';

export async function login(req, res, next) {
	try {
		const resultado = await servicio.login(req.body);
		res.json(resultado);
	} catch (error) {
		next(error);
	}
}

export async function registro(req, res, next) {
	try {
		const resultado = await servicio.registrar(req.body);
		res.status(201).json(resultado);
	} catch (error) {
		next(error);
	}
}
