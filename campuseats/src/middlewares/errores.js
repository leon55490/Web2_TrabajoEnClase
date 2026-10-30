// src/middlewares/errores.js
import { ErrorHttp } from '../errores.js';

export function manejadorErrores(err, req, res, next) {
	if (err instanceof ErrorHttp) {
		return res.status(err.codigo).json({ error: err.message });
	}

	if (err?.code === 'P2002') {
		return res.status(409).json({ error: 'Ya existe un registro con ese valor único' });
	}

	if (err?.code === 'LIMIT_FILE_SIZE') {
		return res.status(400).json({ error: 'La imagen no puede superar 2 MB' });
	}

	console.error('Error no controlado:', err);
	res.status(500).json({ error: 'Error interno del servidor' });
}
