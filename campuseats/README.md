# CampusEats API

API de Express para el menú y los pedidos de CampusEats. Usa PostgreSQL y Prisma.

## Arranque local

1. Inicia Docker Desktop.
2. Crea PostgreSQL:

   ```powershell
   docker run --name campuseats-db -e POSTGRES_USER=campuseats -e POSTGRES_PASSWORD=secreto123 -e POSTGRES_DB=campuseats -p 5433:5432 -d postgres:16
   ```

   Si el contenedor ya existe, usa `docker start campuseats-db`.
3. Copia `.env.example` como `.env` y cambia `JWT_SECRET`.
4. Instala dependencias y aplica migraciones:

   ```powershell
   npm install
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. Inicia la API:

   ```powershell
   npm run dev
   ```

La API queda disponible en `http://localhost:4000`.

## Credenciales de desarrollo

El seed crea estas cuentas:

- Administrador: `admin@campuseats.co` / `Admin123!`
- Cliente: `ana@ucaldas.edu.co` / `Cliente123!`

Las contraseñas se guardan con bcrypt. El seed es idempotente y actualiza las credenciales de estas cuentas al volver a ejecutarse.

## Rutas principales

- `POST /api/auth/registro` y `POST /api/auth/login` son públicas.
- `GET /api/productos` y `GET /api/productos/:id` son públicas.
- `POST /api/productos/:id/imagen` permite a un ADMIN subir una imagen usando
  `multipart/form-data` con el campo `imagen`.
- Para crear o actualizar un producto, envía `multipart/form-data` con el archivo opcional
  `imagen` (JPG, PNG o WEBP, máximo 2 MB). La imagen queda disponible bajo `/imagenes/productos`.
- La gestión de productos requiere un token de ADMIN.
- Crear, listar, consultar y cambiar el estado de pedidos requiere autenticación; cambiar estados requiere ADMIN.
- La identidad del pedido se toma del token, nunca de `usuarioId` enviado por el cliente.
- Las respuestas de usuarios y pedidos no exponen `passwordHash`.
- Los SMS usan el proveedor simulado por defecto. Para Twilio, configura
  `SMS_PROVEEDOR=twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_FROM`.

Para las rutas protegidas, envía `Authorization: Bearer <token>`.
