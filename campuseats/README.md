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

4. Inicia el servidor en `http://localhost:4000`:
   ```powershell
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

## 4. Servicios externos (Semana 9)

1. **Correo transaccional (`src/services/email.service.js`)**: Usa Nodemailer + Ethereal (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Se dispara después del `COMMIT` de `crearPedido` sin `await` y con `.catch()`.
2. **Subida de imágenes (`src/middlewares/subirImagen.js`)**: Usa Multer con nombres UUID en `uploads/productos` (servidas en `/imagenes/productos`), validando MIME (`JPG`, `PNG`, `WebP`) con `415`, tamaño máximo de 2 MB con `413` y campo inesperado con `400`.
3. **SMS con proveedor intercambiable (`src/services/sms/`)**: Selección dinámica por `SMS_PROVEEDOR` (`simulado` o `twilio`) al marcar un pedido como `LISTO`.
4. **API de terceros (`src/services/tasas.service.js`)**: Consulta `open.er-api.com` con `AbortSignal.timeout(3000)` y degrada con `usd: null` si el servicio externo falla o tarda.
