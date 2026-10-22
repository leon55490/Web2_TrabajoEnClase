// index.js — primer script Node: JavaScript fuera del navegador
// Aquí no hay document ni window: hay process, fs, http...

const nombre = process.argv[2] ?? 'mundo'; // argumento de la terminal
console.log(`Hola, ${nombre}. Esto es JavaScript en el servidor.`);

// Node moderno trae fetch incorporado: consumamos una API real
const respuesta = await fetch('https://jsonplaceholder.typicode.com/users/1');
console.log('Código de estado:', respuesta.status);
console.log('Content-Type:', respuesta.headers.get('content-type'));

const usuario = await respuesta.json();
console.log(`El usuario 1 se llama ${usuario.name} (${usuario.email})`);
