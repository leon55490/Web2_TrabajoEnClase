import { Router } from 'express';
import { body, param } from 'express-validator';
import * as controlador from '../controllers/usuarios.controller.js';
import { autenticar, permitirRoles } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

router.use(autenticar, permitirRoles('ADMIN'));

router.get('/', controlador.listar);
router.get(
	'/:id',
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo'),
	validar,
	controlador.obtener
);
router.post(
	'/',
	body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
	body('email').isEmail().withMessage('El email no es válido'),
	body('password')
		.isString()
		.isLength({ min: 8 })
		.withMessage('La contraseña es obligatoria'),
	body('rol').optional().isIn(['CLIENTE', 'ADMIN']).withMessage('El rol no es válido'),
	validar,
	controlador.crear
);

export default router;
