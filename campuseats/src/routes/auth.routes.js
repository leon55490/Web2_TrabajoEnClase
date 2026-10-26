import { Router } from 'express';
import { body, param } from 'express-validator';
import * as controlador from '../controllers/auth.controller.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

router.post(
	'/login',
	body('email').isEmail().withMessage('El email no es válido').normalizeEmail(),
	body('password')
		.isString()
		.isLength({ min: 1 })
		.withMessage('La contraseña es obligatoria'),
	validar,
	controlador.login
);

router.post(
	'/registro',
	body('nombre')
		.trim()
		.notEmpty()
		.withMessage('El nombre es obligatorio')
		.isLength({ max: 80 })
		.withMessage('Máximo 80 caracteres'),
	body('email').isEmail().withMessage('El email no es válido').normalizeEmail(),
	body('password')
		.isString()
		.isLength({ min: 8 })
		.withMessage('La contraseña es obligatoria'),
	validar,
	controlador.registro
);

export default router;
