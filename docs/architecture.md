# Diseño de Arquitectura

## 1. Componentes Principales

1. **Backend (API)**  
   - Almacena usuarios, categorías, URLs, plantillas y campañas.
   - Expone endpoints REST para autenticación y CRUD de datos.
   - Devuelve y valida tokens JWT.

2. **Extensión de Navegador**  
   - **Background Script**:
     - Maneja la autenticación (token).
     - Controla la apertura de pestañas y la ejecución de campañas.
     - Llama a los endpoints del backend para crear/editar/borrar datos y reportar resultados.
   - **Popup**:
     - Interfaz cuando el usuario hace clic en el ícono de la extensión.
     - Permite login, CRUD de categorías/URLs/plantillas, gestión de campañas (iniciar, pausar).
   - **Content Scripts**:
     - Inyectados en cada pestaña abierta para detectar y llenar el formulario, resolver captchas, hacer submit.
     - Reportan resultado al background script.

## 2. Diagrama de Flujo General

1. **El usuario se loguea en el Popup** → envía credenciales al backend → recibe JWT.
2. **Carga de Datos**: la extensión (background) obtiene categorías, URLs, plantillas, campañas del backend.
3. **Crear/Editar Campañas** en el Popup → se guarda en el backend.
4. **Iniciar Campaña** → background abre pestañas y content scripts rellenan formularios.
5. **Reportar Resultado** → content script -> background -> backend (registra éxito o error).
6. **Ver Progreso** en el Popup (consulta estado al backend).

## 3. Modelo de Datos (Ejemplo)

- **Usuarios** (id, email, passwordHash, rol, createdAt, updatedAt)
- **Categorías** (id, nombre, descripcion, userId, createdAt, updatedAt)
- **URLs** (id, categoriaId, url, createdAt, updatedAt)
- **Plantillas** (id, userId, nombre, contenido, createdAt, updatedAt)
- **Campañas** (id, userId, nombre, plantillaId, estado, createdAt, updatedAt)
- **Campaña_URLs** (id, campanaId, urlId, estado, resultado, updatedAt)

