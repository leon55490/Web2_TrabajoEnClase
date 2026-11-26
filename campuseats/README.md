# CampusEats API

API REST para el menú, pedidos y reportes de la cafetería universitaria CampusEats, construida con **Express 5**, **Prisma 7** y **PostgreSQL 16**.

## 1. Arranque desde cero

1. Inicia Docker Desktop y crea el contenedor de PostgreSQL:
   ```powershell
   docker run --name campuseats-db -e POSTGRES_USER=campuseats -e POSTGRES_PASSWORD=secreto123 -e POSTGRES_DB=campuseats -p 5433:5432 -d postgres:16
   ```
   *(Si ya existe el contenedor, enciéndelo con `docker start campuseats-db`).*

2. Copia `.env.example` a `.env` y ajusta `JWT_SECRET` y las credenciales de Ethereal:
   ```powershell
   cp .env.example .env
   ```

3. Instala dependencias, aplica migraciones, genera el cliente y corre el seed:
   ```powershell
   npm install
   npx prisma migrate deploy --config prisma7.config.ts
   npx prisma generate --config prisma7.config.ts
   npx prisma db seed --config prisma7.config.ts
   ```

4. Levanta los **cuatro procesos** en cuatro terminales distintas (el gateway queda como única puerta pública en `http://localhost:4000`):
   - **Terminal 1 (`core` en `:4001`)**:
     ```powershell
     npm run dev
     ```
   - **Terminal 2 (`notificaciones` en `:4002`)**:
     ```powershell
     cd servicios/notificaciones
     npm install
     npm run dev
     ```
   - **Terminal 3 (`pagos` en `:4003`)**:
     ```powershell
     cd servicios/pagos
     npm install
     npm run dev
     ```
   - **Terminal 4 (`gateway` en `:4000`)**:
     ```powershell
     cd servicios/gateway
     npm install
     npm run dev
     ```

## 2. Credenciales del Seed

- **Administrador (`ADMIN`)**: `admin@campuseats.co` / `Admin123!`
- **Cliente (`CLIENTE`)**: `ana@ucaldas.edu.co` / `Cliente123!` (teléfono: `+573001234567`)

## 3. Política de acceso (Endpoint × Rol)

| Endpoint | Acceso | Descripción |
| :--- | :--- | :--- |
| `POST /api/auth/registro` | Público | Registro de cuenta (`CLIENTE`) |
| `POST /api/auth/login` | Público | Inicio de sesión (retorna JWT) |
| `GET /api/productos` | Público | Listar menú (`?disponibles=true&buscar=...`) |
| `GET /api/productos/:id` | Público | Detalle de un producto |
| `GET /api/productos/:id/precio-usd` | Público | Precio en USD consultando API de tasas con degradación elegante |
| `POST /api/productos` | `ADMIN` | Crear producto |
| `PUT /api/productos/:id` | `ADMIN` | Actualizar producto |
| `PATCH /api/productos/:id/stock` | `ADMIN` | Ajuste atómico de stock (`{ delta }`) |
| `POST /api/productos/:id/imagen` | `ADMIN` | Subir imagen (`multipart/form-data`, campo `imagen`, máx 2 MB) |
| `DELETE /api/productos/:id` | `ADMIN` | Eliminar producto (`204`) |
| `/api/usuarios` (todas las rutas) | `ADMIN` | Listar, ver y crear usuarios (sin exponer `passwordHash`) |
| `POST /api/pedidos` | `CLIENTE` o `ADMIN` | Crear pedido transaccional (toma `usuarioId` del token) |
| `GET /api/pedidos` | `ADMIN` | Listar todos los pedidos con filtros y paginación |
| `GET /api/pedidos/mios` | Autenticado | Listar únicamente los pedidos del usuario autenticado |
| `GET /api/pedidos/:id` | Dueño o `ADMIN` | Ver detalle de un pedido (para otro cliente responde `404`) |
| `PATCH /api/pedidos/:id/estado` | `ADMIN` | Cambiar estado del pedido (dispara SMS cuando pasa a `LISTO`) |
| `GET /api/reportes/ventas-dia` | `ADMIN` | Reporte de ventas del día actual excluyendo cancelados |

## 4. Servicios externos (Semana 9 → extraídos en Semana 11)

1. **Correo transaccional (`servicios/notificaciones/src/email.service.js`, invocado por `src/clientes/notificaciones.cliente.js`)**: Usa Nodemailer + Ethereal (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Se dispara después del `COMMIT` de `crearPedido` sin `await`, con timeout de 3 s y con `.catch()`.
2. **Subida de imágenes (`src/middlewares/subirImagen.js`)**: Usa Multer con nombres UUID en `uploads/productos` (servidas en `/imagenes/productos`), validando MIME (`JPG`, `PNG`, `WebP`) con `415`, tamaño máximo de 2 MB con `413` y campo inesperado con `400`.
3. **SMS con proveedor intercambiable (`servicios/notificaciones/src/sms/`)**: Selección dinámica por `SMS_PROVEEDOR` (`simulado` o `twilio`) al marcar un pedido como `LISTO`.
4. **API de terceros (`src/services/tasas.service.js`)**: Consulta `open.er-api.com` con `AbortSignal.timeout(3000)` y degrada con `usd: null` si el servicio externo falla o tarda.

## 5. Arquitectura de Microservicios (Semana 11)

```text
                navegador, Postman
                        │
                 ┌──────▼───────┐
                 │ gateway :4000│ ← la única puerta pública (GET /salud, /api, /socket.io, /imagenes...)
                 └──────┬───────┘
                        │ reenvía HTTP y upgrade WebSocket
                 ┌──────▼───────┐  HTTP + token  ┌────────────────────┐
                 │ core :4001   │───────────────▶│ notificaciones:4002│
                 │ (+ la base)  │───────────────▶│ pagos :4003        │
                 └──────────────┘                └────────────────────┘
```

| Servicio | Puerto | Rol | Si se cae... |
| :--- | :--- | :--- | :--- |
| **API Gateway** (`servicios/gateway`) | `4000` | Única puerta pública (`http-proxy-middleware` + upgrade WebSocket + `/salud` distribuido) | El cliente no puede entrar al sistema. |
| **Core** (raíz) | `4001` | Auth, productos, pedidos, reportes y Socket.IO + PostgreSQL | No hay operación disponible (`503` en `/salud`). |
| **Notificaciones** (`servicios/notificaciones`) | `4002` | Envío de correos (Nodemailer/Ethereal) y SMS (`202 Accepted`) | **La venta sigue**: el pedido se crea (`201`) o cambia de estado; el fallo se atrapa con `.catch()`. |
| **Pagos simulado** (`servicios/pagos`) | `4003` | Cobros (`402` si `> $100.000`) y reembolsos por compensación (Saga) | **La venta se cancela**: responde `503` antes de tocar la base de datos. Si la transacción de base de datos falla tras cobrar (ej. stock insuficiente `409`), el core dispara `POST /pagos/reembolsar`. |

