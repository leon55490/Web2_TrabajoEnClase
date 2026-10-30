// src/routes/productos.routes.js — versión protegida
// El requiereApiKey de la semana 4 se va: ahora el portero es el token
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/productos.controller.js';
import { autenticar, permitirRoles } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';
import { subirImagen } from '../middlewares/subirImagen.js';

const router = Router();

const reglasProducto = [
	body('nombre')
		.trim()
		.notEmpty()
		.withMessage('El nombre es obligatorio')
		.isLength({ max: 80 })
		.withMessage('Máximo 80 caracteres'),
	body('precio')
		.isInt({ min: 0 })
		.withMessage('El precio debe ser un entero ≥ 0')
		.toInt(),
	body('stock')
		.optional()
		.isInt({ min: 0 })
		.withMessage('El stock debe ser un entero ≥ 0')
		.toInt(),
];

// Leer el menú: público
router.get(
	'/',
	query('pagina').optional().isInt({ min: 1 }).withMessage('pagina debe ser ≥ 1'),
	validar,
	controlador.listar
);

router.get(
	'/:id',
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo'),
	validar,
	controlador.obtener
);

// Subir la foto de un producto: los porteros y la validación ocurren antes de Multer.
router.post(
	'/:id/imagen',
	autenticar,
	permitirRoles('ADMIN'),
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo'),
	validar,
	subirImagen.single('imagen'),
	controlador.subirFoto
);

// Gestionar productos: solo ADMIN autenticado (autenticar SIEMPRE antes de permitirRoles)
router.post(
	'/',
	autenticar,
	permitirRoles('ADMIN'),
	subirImagen.single('imagen'),
	reglasProducto,
	validar,
	controlador.crearProducto
);

router.put(
	'/:id',
	autenticar,
	permitirRoles('ADMIN'),
	param('id').isInt({ min: 1 }),
	validar,
	subirImagen.single('imagen'),
	reglasProducto,
	validar,
	controlador.actualizar
);

router.patch(
	'/:id/stock',
	autenticar,
	permitirRoles('ADMIN'),
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo'),
	body('delta').isInt().withMessage('delta debe ser un entero').toInt(),
	validar,
	controlador.ajustarStock
);

router.delete(
	'/:id',
	autenticar,
	permitirRoles('ADMIN'),
	param('id').isInt({ min: 1 }),
	validar,
	controlador.eliminar
);

export default router;
