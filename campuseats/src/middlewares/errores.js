// src/middlewares/errores.js
import multer from 'multer';
import { ErrorHttp } from '../errores.js';

export function manejadorErrores(err, req, res, next) {
	if (err instanceof ErrorHttp) {
		return res.status(err.codigo).json({ error: err.message });
	}

	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(413).json({ error: 'El archivo supera el máximo de 2 MB' });
		}
		if (err.code === 'LIMIT_UNEXPECTED_FILE') {
			return res.status(400).json({
				error: `Se esperaba el campo "imagen", pero llegó "${err.field}"`,
			});
		}
		return res.status(400).json({ error: err.message });
	}

	if (err?.code === 'P2002') {
		return res.status(409).json({ error: 'Ya existe un registro con ese valor único' });
	}

	console.error('Error no controlado:', err);
	res.status(500).json({ error: 'Error interno del servidor' });
}
