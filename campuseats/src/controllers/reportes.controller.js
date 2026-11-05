// src/controllers/reportes.controller.js
import * as servicio from '../services/reportes.service.js';

export async function ventasDia(req, res, next) {
	try {
		const reporte = await servicio.ventasDelDia();
		res.json(reporte);
	} catch (error) {
		next(error);
	}
}
