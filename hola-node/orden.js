console.log('1 · síncrono');

setTimeout(() => console.log('2 · setTimeout 0'), 0);
setImmediate(() => console.log('3 · setImmediate'));

Promise.resolve().then(() => console.log('4 · promesa'));
queueMicrotask(() => console.log('5 · microtarea'));
process.nextTick(() => console.log('6 · nextTick'));

console.log('7 · síncrono');
