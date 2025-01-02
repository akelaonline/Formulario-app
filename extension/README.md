# Form Filling Assistant - Chrome Extension

## Descripción
Form Filling Assistant es una extensión de Chrome que ayuda a automatizar el llenado de formularios de contacto en sitios web. Utiliza la autenticación de Google y almacenamiento en la nube para mantener la información del usuario sincronizada.

## Arquitectura

### Componentes Principales

#### 1. Autenticación (`auth.js`)
- Utiliza `chrome.identity` para la autenticación con Google
- Maneja tokens de acceso y información del usuario
- Métodos principales:
  - `getToken()`: Obtiene el token de autenticación
  - `getUserInfo()`: Recupera la información del usuario
  - `signOut()`: Cierra la sesión del usuario

#### 2. Almacenamiento (`storage.js`)
- Interactúa con Firestore a través de REST APIs
- Maneja las operaciones CRUD para categorías
- Métodos principales:
  - `getCategories()`: Obtiene las categorías del usuario
  - `addCategory()`: Agrega una nueva categoría
  - `deleteCategory()`: Elimina una categoría existente

#### 3. Interfaz de Usuario (`popup.html`, `popup.js`)
- Interfaz minimalista usando Tailwind CSS
- Manejo de estados de autenticación
- Gestión de categorías

### Seguridad y Permisos

#### Manifest V3
```json
{
  "permissions": [
    "storage",
    "identity"
  ],
  "oauth2": {
    "client_id": "...",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/datastore"
    ]
  }
}
```

### Estructura de Archivos
```
extension/
├── manifest.json
├── src/
│   ├── html/
│   │   └── popup.html
│   ├── js/
│   │   ├── auth.js
│   │   ├── storage.js
│   │   ├── popup.js
│   │   └── contentScript.js
│   └── lib/
│       └── tailwind.min.css
```

## Características de Seguridad
1. No usa Firebase SDK para evitar problemas de CSP
2. Todos los scripts son locales (no CDN)
3. No hay scripts inline
4. Usa chrome.identity para manejo seguro de autenticación
5. Tokens almacenados de forma segura usando chrome.storage

## Flujo de Autenticación
1. Usuario hace clic en "Iniciar sesión con Google"
2. chrome.identity maneja el flujo de OAuth2
3. Se obtiene el token de acceso
4. Se recupera la información del usuario
5. Se almacena el token localmente
6. Se cargan las categorías del usuario

## Manejo de Datos
1. Los datos se almacenan en Firestore
2. Todas las operaciones requieren un token válido
3. Se usa la REST API de Firestore para operaciones CRUD
4. Los datos se sincronizan en tiempo real

## Resolución de Problemas de CSP en Manifest V3

### Problema Original
La extensión originalmente usaba Firebase SDK a través de CDN y scripts inline, lo que causaba varios errores de Content Security Policy (CSP):
1. No se podían cargar scripts desde `gstatic.com`
2. No se permitían scripts inline
3. Violaciones de la directiva `script-src 'self'`

### Solución Implementada

#### 1. Eliminación de Dependencias Externas
- Se removieron todas las cargas de scripts desde CDN:
  ```html
  <!-- Eliminado -->
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>
  ```

#### 2. Migración a APIs Nativas de Chrome
- Reemplazo de Firebase Auth por chrome.identity:
  ```javascript
  // Antes
  firebase.auth().signInWithPopup(provider)

  // Después
  chrome.identity.getAuthToken({ interactive: true })
  ```

- Uso de REST APIs para Firestore:
  ```javascript
  // Antes
  firebase.firestore().collection('categories').get()

  // Después
  fetch(`${this.baseUrl}/categories`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  ```

#### 3. Limpieza de Archivos
Se eliminaron archivos innecesarios:
- `firebase-config.js`
- `firebase-init.js`
- `firebase-module.js`

#### 4. Estructura Final
```
src/
├── js/
│   ├── auth.js      # Manejo de autenticación con chrome.identity
│   ├── storage.js   # Comunicación con Firestore vía REST
│   └── popup.js     # Lógica de la UI
└── html/
    └── popup.html   # UI sin scripts inline
```

### Beneficios de la Solución
1. Cumplimiento total con CSP de Manifest V3
2. Mejor rendimiento al eliminar dependencias externas
3. Mayor seguridad al usar APIs nativas de Chrome
4. Código más mantenible y modular

### Notas de Implementación
- Los tokens de autenticación se manejan de forma segura con chrome.storage
- Las operaciones de Firestore usan REST API con tokens OAuth
- No se requieren modificaciones en el manifest.json para CSP

## Instalación
1. Clonar el repositorio
2. Abrir Chrome y navegar a `chrome://extensions`
3. Activar "Modo desarrollador"
4. Hacer clic en "Cargar descomprimida"
5. Seleccionar la carpeta de la extensión

## Desarrollo
Para modificar la extensión:
1. Los cambios en archivos JS requieren recargar la extensión
2. Los cambios en CSS o HTML son inmediatos
3. Usar las herramientas de desarrollo de Chrome para debugging

## Notas Importantes
- La extensión requiere una cuenta de Google
- Los permisos son mínimos y necesarios
- Cumple con las políticas de Manifest V3
- No usa recursos externos para máxima seguridad
