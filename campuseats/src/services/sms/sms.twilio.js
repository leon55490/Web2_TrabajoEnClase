// Proveedor real con la API REST de Twilio.
export async function enviarSmsTwilio(telefono, mensaje) {
	const cuenta = process.env.TWILIO_ACCOUNT_SID;
	const token = process.env.TWILIO_AUTH_TOKEN;

	const respuesta = await fetch(
		`https://api.twilio.com/2010-04-01/Accounts/${cuenta}/Messages.json`,
		{
			method: 'POST',
			headers: {
				Authorization: `Basic ${Buffer.from(`${cuenta}:${token}`).toString('base64')}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				To: telefono,
				From: process.env.TWILIO_FROM,
				Body: mensaje,
			}),
			signal: AbortSignal.timeout(5000),
		}
	);

	if (!respuesta.ok) {
		const error = await respuesta.json();
		throw new Error(`Twilio falló: ${error.message}`);
	}

	const datos = await respuesta.json();
	return { ok: true, id: datos.sid, proveedor: 'twilio' };
}
