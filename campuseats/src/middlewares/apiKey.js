export function requiereApiKey(req, res, next) {
	if (req.headers['x-api-key'] !== 'secreta123') {
		return res.status(401).json({ error: 'API key inválida' });
	}
	next();
}
