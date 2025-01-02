# Checklist de Implementación

## 1. Documentación Inicial

- [ ] Revisar `requirements.md` (requerimientos funcionales).  
- [ ] Revisar `architecture.md` para entender el diagrama y la base de datos.  

## 2. Backend

1. **API y Modelos**  
   - [ ] Crear proyecto en Node.js/Python (o el stack elegido).  
   - [ ] Definir modelos/tables: Usuarios, Categorías, URLs, Plantillas, Campañas.  
   - [ ] Configurar autenticación JWT (endpoints de login).  
   - [ ] Implementar CRUD de Categorías, URLs, Plantillas.  
   - [ ] Implementar creación/gestión de Campañas.  
   - [ ] Endpoint para reportar resultados (`/campanas/:id/resultados`).  

2. **Pruebas Unitarias (Backend)**  
   - [ ] Asegurar que el login funciona con credenciales válidas/invalidas.  
   - [ ] Testear CRUD básico (categorías, URLs, plantillas).  
   - [ ] Testear creación de campañas y registro de resultados.  

## 3. Extensión de Navegador

1. **Estructura de la Extensión**  
   - [ ] Crear `manifest.json` con permisos (`tabs`, `storage`, etc.).  
   - [ ] Crear `background.js`: manejo de login, token, aperturas de pestañas, comunicaciones con backend.  
   - [ ] Crear `popup.html` y `popup.js`: UI de login, CRUD básico, selector de campaña.  
   - [ ] Crear `contentScript.js`: detección de formularios, rellenado, envío, manejo captcha.

2. **Integración con Backend**  
   - [ ] Después de login, almacenar token JWT en `chrome.storage.local`.  
   - [ ] Llamar a `/api/categorias`, `/api/urls`, `/api/plantillas` para mostrar en el Popup.  
   - [ ] Crear campaña (`POST /api/campanas`) y luego abrir pestañas cuando se inicia.

3. **Content Script**  
   - [ ] Detectar formulario (inputs y labels).  
   - [ ] Rellenar datos de la plantilla.  
   - [ ] Manejar captcha (si procede).  
   - [ ] Hacer `submit` y escuchar respuesta.  
   - [ ] `chrome.runtime.sendMessage({ urlId, estado, mensaje })` con el resultado.

## 4. Captchas

- [ ] Decidir si usar 2Captcha u otro servicio.  
- [ ] Implementar la lógica en el background script para resolver reCAPTCHA.  
- [ ] Probar con un sitio de ejemplo.

## 5. Pruebas

1. **Unitarias (Backend)**  
   - [ ] Verificar endpoints con un framework de testing (Mocha, Jest, Pytest, etc.).  
2. **Integración (Extensión + Backend)**  
   - [ ] Login, ver datos, crear campaña, ejecutar.  
   - [ ] Revisar logs en el backend para asegurar que se recibe el reporte de cada URL.

## 6. Despliegue

- [ ] Configurar `.env` con variables (DB, JWT_SECRET) para producción.  
- [ ] Desplegar backend (Heroku, AWS, etc.).  
- [ ] Empaquetar la extensión y subirla a la Chrome Web Store (opcionalmente en modo dev).  

## 7. Validación Final

- [ ] Hacer pruebas de carga (muchas URLs) para ver rendimiento.  
- [ ] Revisar logs de error y captchas.  
- [ ] Confirmar que la experiencia del usuario es fluida y segura.

