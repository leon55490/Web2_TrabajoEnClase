// src/routes/productos.routes.js
// Mapa de URLs: qué método+ruta ejecuta qué controller.
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/productos.controller.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

// Reglas reutilizables para crear/actualizar
const reglasProducto = [
	body('nombre')
		.trim()
		.notEmpty()
		.withMessage('El nombre es obligatorio')
		.isLength({ max: 80 })
		.withMessage('Máximo 80 caracteres'),
	body('precio').isInt({ min: 0 }).withMessage('El precio debe ser un entero ≥ 0'),
	body('stock')
		.optional()
		.isInt({ min: 0 })
		.withMessage('El stock debe ser un entero ≥ 0'),
];

router.get(
	'/',
	query('pagina').optional().isInt({ min: 1 }).withMessage('pagina debe ser ≥ 1'),
	query('buscar')
		.optional()
		.trim()
		.isLength({ max: 80 })
		.withMessage('buscar debe tener máximo 80 caracteres'),
	validar,
	controlador.listar
);

router.get(
	'/:id',
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo'),
	validar,
	controlador.obtener
);

router.post('/', reglasProducto, validar, controlador.crearProducto);
router.put(
	'/:id',
	param('id').isInt({ min: 1 }),
	reglasProducto,
	validar,
	controlador.actualizar
);
router.patch(
	'/:id/stock',
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo'),
	body('delta').isInt().withMessage('delta debe ser un entero'),
	validar,
	controlador.ajustarStock
);
router.delete('/:id', param('id').isInt({ min: 1 }), validar, controlador.eliminar);

export default router;
