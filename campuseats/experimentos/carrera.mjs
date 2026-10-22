// experimentos/carrera.mjs — 20 clientes compran 3 unidades AL MISMO TIEMPO.
// Con stock 40 solo alcanza para 13 compras. ¿Cuántas acepta tu API? ¿Cuánto stock queda?
// Uso:  node experimentos/carrera.mjs [idProducto] [puerto]      (por defecto: 1 y 4000)
const id = process.argv[2] ?? '1';
const puerto = process.argv[3] ?? '4000';
const URL_PRODUCTO = `http://localhost:${puerto}/api/productos/${id}`;
const json = { 'Content-Type': 'application/json' };

// 1. Dejar el producto con stock 40 (PUT exige nombre y precio)
const actual = await (await fetch(URL_PRODUCTO)).json();
if (actual.error) throw new Error(`El producto ${id} no existe: créalo primero`);
await fetch(URL_PRODUCTO, {
	method: 'PUT',
	headers: json,
	body: JSON.stringify({ nombre: actual.nombre, precio: actual.precio, stock: 40 }),
});

// 2. Disparar 20 compras simultáneas de 3 unidades
const codigos = await Promise.all(
	Array.from({ length: 20 }, () =>
		fetch(`${URL_PRODUCTO}/stock`, {
			method: 'PATCH',
			headers: json,
			body: JSON.stringify({ delta: -3 }),
		}).then((r) => r.status)
	)
);

// 3. Resultado
const final = (await (await fetch(URL_PRODUCTO)).json()).stock;
console.log(
	`Aceptadas: ${codigos.filter((c) => c === 200).length}  ·  Rechazadas: ${codigos.filter((c) => c === 409).length}  ·  Stock final: ${final}`
);
console.log(
	final < 0
		? '💥 El stock quedó NEGATIVO: vendiste lo que no tenías.'
		: '✅ La base no dejó vender de más.'
);
