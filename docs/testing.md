# Plan de Pruebas

## 1. Pruebas Unitarias (Backend)

- **Autenticación**:
  - Login exitoso con credenciales válidas.
  - Login fallido con credenciales incorrectas.
- **CRUD Categorías, URLs, Plantillas**:
  - Crear, leer, actualizar, eliminar.
- **Campañas**:
  - Crear campaña, verificar que se asocien URLs, etc.
- **Endpoints de Resultados**:
  - Enviar un resultado y verificar que actualice la tabla correspondiente.

## 2. Pruebas de Integración (Extensión + Backend)

1. **Login desde Popup**:
   - Ingresar email/pass → obtener token y almacenarlo.
2. **Carga de Datos**:
   - Comprobar que la extensión descarga categorías, URLs, plantillas y las muestra.
3. **Creación de Campaña**:
   - Desde el popup, crear campaña y revisar en BD que se registró.
4. **Ejecución de Campaña**:
   - Extensión abre pestañas → rellena formularios de prueba → reporta estado.
   - Verificar logs en el backend.

## 3. Pruebas de Stress

- Subir 100+ URLs en una campaña y ver cómo maneja la extensión el abrir pestañas.
- Ver si se respetan los límites configurados (X pestañas en paralelo).

## 4. Pruebas de Captchas

- Sitio de prueba con reCAPTCHA v2.
- Verificar que se integre correctamente con 2Captcha (o resolución manual).
- Chequear error handling si el captcha no se resuelve.

