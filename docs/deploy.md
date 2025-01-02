# Configuración y Despliegue

## 1. Variables de Entorno

- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `JWT_SECRET`
- `CAPTCHA_SERVICE_KEY` (si usas 2Captcha)
- `PORT` (puerto de la API)

## 2. Instalación Local

1. **Backend**:
   - Clonar el repo, entrar en la carpeta `backend`.
   - `npm install` o `yarn install`.
   - Configurar `.env` con las variables de entorno.
   - Correr migraciones si procede (`npx sequelize db:migrate`, etc.).
   - Levantar el servidor: `npm run dev`.
2. **Extensión**:
   - Ir a la carpeta `extension`.
   - `npm install` (si se usan bundlers).
   - `npm run build` → genera carpeta `dist`.
   - Abrir Chrome → Extensiones → Modo desarrollador → “Cargar sin empaquetar” → seleccionar `dist`.

## 3. Despliegue en Producción (Backend)

- Subir a un servicio como Heroku, AWS, Digital Ocean, etc.
- Usar HTTPS (certificado SSL).
- Configurar `.env` en el entorno de producción con credenciales seguras.
- Ajustar logs y monitorizar el rendimiento.

## 4. Publicación de la Extensión

- Crear cuenta de desarrollador en la Chrome Web Store.
- Empaquetar la extensión (`.zip` con `manifest.json` y `dist`).
- Subirlo a la consola de la Chrome Web Store, rellenar ficha, iconos, descripción.
- Esperar la revisión de Google.

