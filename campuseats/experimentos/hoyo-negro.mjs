// experimentos/hoyo-negro.mjs — un "servicio" que acepta la conexión y nunca contesta
import net from 'node:net';
net.createServer(() => {}).listen(4002, () => console.log('Hoyo negro en 4002: acepto y nunca respondo'));
