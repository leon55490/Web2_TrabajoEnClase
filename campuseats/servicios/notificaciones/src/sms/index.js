// servicios/notificaciones/src/sms/index.js — interfaz del proveedor SMS
import { enviarSmsSimulado } from './sms.simulado.js';
import { enviarSmsTwilio } from './sms.twilio.js';

export function enviarSms(telefono, mensaje) {
	const enviar =
		process.env.SMS_PROVEEDOR === 'twilio' ? enviarSmsTwilio : enviarSmsSimulado;
	return enviar(telefono, mensaje);
}
