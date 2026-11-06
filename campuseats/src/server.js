// src/server.js — solo arranca
// Semana 10: el servidor HTTP se crea a mano para que la API y Socket.IO lo compartan
import http from 'node:http';
import app from './app.js';
import { iniciarTiempoReal } from './tiemporeal.js';

const servidor = http.createServer(app); // Express atiende las peticiones HTTP…
iniciarTiempoReal(servidor);             // …y Socket.IO, las conexiones /socket.io/ del MISMO servidor

const PUERTO = process.env.PORT ?? 4000;
servidor.listen(PUERTO, () => {
	console.log(`CampusEats API + tiempo real en http://localhost:${PUERTO}`);
});
