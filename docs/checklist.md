# Checklist de Implementación

## 1. Documentación Inicial

- [x] Revisar `requirements.md` (requerimientos funcionales).  
- [x] Revisar `architecture.md` para entender el diagrama y la base de datos.  

## 2. Backend

1. **Firebase y API**  
   - [x] Configurar proyecto en Firebase
   - [x] Implementar Firebase Authentication
   - [x] Configurar Firestore para la base de datos
   - [x] Crear proyecto en Node.js/Python (o el stack elegido)
   - [x] Definir modelos/tables: Usuarios, Categorías, URLs, Plantillas, Campañas
   - [x] Implementar CRUD de Categorías, URLs, Plantillas
   - [x] Implementar creación/gestión de Campañas
   - [x] Endpoint para reportar resultados (`/campanas/:id/resultados`)
   - [x] Implementar sistema de logs para debugging

2. **Sistema de Logs**
   - [x] Configurar sistema de logs (Winston/Morgan para Node.js o similar)
   - [x] Implementar logs para:
     - Autenticación y sesiones
     - Operaciones CRUD
     - Errores y excepciones
     - Estado de campañas
   - [ ] Crear interfaz para visualizar logs

3. **Pruebas Unitarias (Backend)**  
   - [x] Asegurar que la autenticación con Firebase funciona
   - [x] Testear CRUD básico (categorías, URLs, plantillas)
   - [x] Testear creación de campañas y registro de resultados
   - [x] Verificar funcionamiento del sistema de logs

## 3. Extensión de Navegador

1. **Estructura de la Extensión**  
   - [x] Crear `manifest.json` con permisos (`tabs`, `storage`, etc.)
   - [x] Crear `background.js`: manejo de Firebase Auth, aperturas de pestañas
   - [x] Crear `popup.html` y `popup.js`: UI de login, CRUD básico, selector de campaña
   - [ ] Crear `contentScript.js`: detección de formularios, rellenado, envío, manejo captcha

2. **Integración con Firebase**  
   - [x] Implementar login con Firebase en el popup
   - [x] Manejar estado de autenticación y tokens
   - [x] Implementar recuperación de sesión
   - [x] Integrar Firestore para datos de la aplicación

3. **Content Script**  
   - [x] Detectar formulario (inputs y labels)
   - [x] Rellenar datos de la plantilla
   - [x] Manejar captcha (si procede)
   - [x] Hacer `submit` y escuchar respuesta
   - [x] Enviar resultados y logs al backend

## 4. Captchas

- [x] Decidir si usar 2Captcha u otro servicio
- [x] Implementar la lógica en el background script para resolver reCAPTCHA
- [x] Probar con un sitio de ejemplo

## 5. Pruebas

1. **Unitarias (Backend)**  
   - [x] Verificar endpoints con un framework de testing
   - [x] Probar integración con Firebase
   - [x] Verificar sistema de logs

2. **Integración (Extensión + Backend)**  
   - [x] Login con Firebase, ver datos, crear campaña, ejecutar
   - [x] Verificar logs de debugging
   - [x] Probar recuperación de sesión

## 6. Despliegue

- [x] Configurar Firebase en producción
- [x] Desplegar backend
- [ ] Empaquetar la extensión para Chrome Web Store

## 7. Validación Final

- [ ] Hacer pruebas de carga (muchas URLs) para ver rendimiento
- [ ] Revisar logs de error y captchas
- [ ] Confirmar que la experiencia del usuario es fluida y segura
