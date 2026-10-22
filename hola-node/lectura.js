import { readFile, readFileSync } from 'node:fs';

console.time('sincrono');
readFileSync('grande.txt');
console.timeEnd('sincrono');
console.log('¿pude hacer algo mientras leía? NO');

console.time('asincrono');
readFile('grande.txt', () => console.timeEnd('asincrono'));
console.log(
	'¿pude hacer algo mientras leía? SÍ — esta línea se imprimió antes de terminar'
);
