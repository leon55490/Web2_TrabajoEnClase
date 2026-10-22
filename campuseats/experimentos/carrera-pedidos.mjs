// experimentos/carrera-pedidos.mjs — 20 clientes piden 3 unidades del mismo producto AL MISMO TIEMPO.
// Con stock 40 solo alcanza para 13 pedidos. ¿Cuántos acepta tu API? ¿Cuánto stock queda?
// Uso:  node carrera-pedidos.mjs [idProducto] [puerto]      (por defecto: 4 = Empanada, y 4000)
const id = process.argv[2] ?? '4';
const puerto = process.argv[3] ?? '4000';
const API = `http://localhost:${puerto}/api`;
const json = { 'Content-Type': 'application/json' };

// 1. Dejar el producto con stock 40 (PUT exige nombre y precio)
const actual = await (await fetch(`${API}/productos/${id}`)).json();
if (actual.error) throw new Error(`El producto ${id} no existe: corre el seed (paso 2)`);
await fetch(`${API}/productos/${id}`, {
	method: 'PUT',
	headers: json,
	body: JSON.stringify({ nombre: actual.nombre, precio: actual.precio, stock: 40 }),
});

// 2. Disparar 20 pedidos simultáneos de 3 unidades, a nombre de Ana (id 2 en el seed)
const pedido = { usuarioId: 2, items: [{ productoId: Number(id), cantidad: 3 }] };
const codigos = await Promise.all(
	Array.from({ length: 20 }, () =>
		fetch(`${API}/pedidos`, {
			method: 'POST',
			headers: json,
			body: JSON.stringify(pedido),
		}).then((r) => r.status)
	)
);

// 3. Resultado
const final = (await (await fetch(`${API}/productos/${id}`)).json()).stock;
console.log(
	`Aceptados: ${codigos.filter((c) => c === 201).length}  ·  Rechazados: ${codigos.filter((c) => c === 409).length}  ·  Stock final: ${final}`
);
console.log(
	final < 0
		? '💥 El stock quedó NEGATIVO: la transacción no lo impidió.'
		: '✅ La base no dejó vender de más.'
);
