// src/middlewares/auth.js
import jwt from 'jsonwebtoken';

// Autenticación: ¿quién eres? Verifica el token del header Authorization
export function autenticar(req, res, next) {
	const header = req.headers.authorization; // "Bearer eyJhbGci..."
	if (!header?.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Token requerido' });
	}
	const token = header.slice(7); // quita "Bearer "

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		// Dejamos la identidad disponible para controllers y middlewares siguientes
		req.usuario = { id: payload.sub, rol: payload.rol };
		next();
	} catch {
		// Firma inválida o token expirado
		return res.status(401).json({ error: 'Token inválido o expirado' });
	}
}

// Autorización: ¿tienes permiso? Se usa DESPUÉS de autenticar
export function permitirRoles(...roles) {
	return (req, res, next) => {
		if (!roles.includes(req.usuario.rol)) {
			// 403: sé quién eres, pero esto no te toca
			return res.status(403).json({ error: 'No tienes permisos para esta operación' });
		}
		next();
	};
}
