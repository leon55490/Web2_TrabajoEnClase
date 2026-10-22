// utilidades.js — un módulo propio
export function formatearPrecio(centavos) {
	// En el curso guardamos dinero en enteros (pesos) para evitar
	// los errores de redondeo de los números flotantes
	return `$${centavos.toLocaleString('es-CO')}`;
}

export const IVA = 0.19;
