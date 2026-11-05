// src/routes/pedidos.routes.js — validación de formato en la frontera
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/pedidos.controller.js';
import { autenticar, permitirRoles } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const ESTADOS = ['RECIBIDO', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'];

const reglasFiltroPedidos = [
	query('estado')
		.optional()
		.isIn(ESTADOS)
		.withMessage(`estado debe ser uno de: ${ESTADOS.join(', ')}`),
	query('pagina').optional().isInt({ min: 1 }).withMessage('pagina debe ser ≥ 1'),
	query('porPagina')
		.optional()
		.isInt({ min: 1, max: 50 })
		.withMessage('porPagina va de 1 a 50'),
	query('desde').optional().isISO8601().withMessage('desde debe ser una fecha AAAA-MM-DD'),
];

// Listar todos los pedidos: solo ADMIN
router.get(
	'/',
	autenticar,
	permitirRoles('ADMIN'),
	reglasFiltroPedidos,
	validar,
	controlador.listar
);

// Listar mis propios pedidos: autenticado (va ANTES de /:id)
router.get(
	'/mios',
	autenticar,
	reglasFiltroPedidos,
	validar,
	controlador.listarMios
);

// Ver un pedido: dueño del pedido o ADMIN (se verifica en el service)
router.get(
	'/:id',
	autenticar,
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo'),
	validar,
	controlador.obtener
);

router.post(
	'/',
	autenticar,
	body('items')
		.isArray({ min: 1 })
		.withMessage('items debe ser un arreglo con al menos un producto'),
	body('items.*.productoId')
		.isInt({ min: 1 })
		.withMessage('productoId debe ser un entero positivo')
		.toInt(),
	body('items.*.cantidad')
		.isInt({ min: 1 })
		.withMessage('La cantidad mínima es 1')
		.toInt(),
	validar,
	controlador.crear
);

router.patch(
	'/:id/estado',
	autenticar,
	permitirRoles('ADMIN'),
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo'),
	body('estado')
		.isIn(ESTADOS.slice(1))
		.withMessage('estado debe ser PREPARANDO, LISTO, ENTREGADO o CANCELADO'),
	validar,
	controlador.cambiarEstado
);

export default router;
