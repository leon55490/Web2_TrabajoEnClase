// nativos.js — fs, path y process en acción
import fs from 'node:fs/promises'; // sistema de archivos (versión promesas)
import path from 'node:path'; // manejo de rutas multiplataforma
import { formatearPrecio } from './utilidades.js'; // módulo propio (¡con .js!)

// process: información y control del proceso actual
console.log('Directorio de trabajo:', process.cwd());
console.log('Versión de Node:', process.version);
console.log('Variable PATH definida:', Boolean(process.env.PATH));

// path.join arma rutas correctas en Windows, macOS y Linux
const archivo = path.join(process.cwd(), 'datos', 'menu.json');

// fs con promesas: crear carpeta, escribir y leer un JSON
await fs.mkdir(path.dirname(archivo), { recursive: true });

const menu = [
	{ nombre: 'Almuerzo del día', precio: 12000 },
	{ nombre: 'Jugo natural', precio: 4000 },
];
await fs.writeFile(archivo, JSON.stringify(menu, null, 2), 'utf-8');

const contenido = await fs.readFile(archivo, 'utf-8');
const leido = JSON.parse(contenido);

for (const item of leido) {
	console.log(`${item.nombre}: ${formatearPrecio(item.precio)}`);
}
