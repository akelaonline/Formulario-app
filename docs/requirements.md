# Requerimientos Funcionales

## 1. Visión General

El objetivo es desarrollar una **extensión de navegador** que permita a los usuarios:

- **Autenticarse** contra un servidor (backend).
- **Cargar y gestionar** Categorías, URLs y Plantillas.
- **Crear Campañas** que combinan Plantillas y listas de URLs.
- **Automatizar** el llenado de formularios de contacto en esas URLs, usando la IP del usuario y un navegador visible.
- **Manejar Captchas** (automático o manual) y reportar el estado de cada envío.

## 2. Actores

- **Usuario**:
  - Gestiona categorías, URLs, plantillas.
  - Crea y controla campañas (inicio, pausa, detención).
  - Ve el progreso de los formularios enviados.
- **Administrador** (opcional):
  - Maneja usuarios, suscripciones, etc.
  - Tiene acceso a datos globales.

## 3. Funcionalidades Principales

1. **Autenticación** (usando Firebase Authentication).
2. **Gestión de Datos** (categorías, URLs, plantillas) con CRUD.
3. **Creación y Gestión de Campañas** (estado: pendiente, en progreso, pausada, finalizada).
4. **Ejecución de Campañas** (la extensión abre pestañas, rellena formularios y reporta resultados).
5. **Progreso y Reportes** (cuántos formularios completados, errores, etc.).
6. **Sistema de Logs** para debugging y seguimiento de errores.

## 4. Requisitos No Funcionales

- **Seguridad**: Firebase Authentication, HTTPS.
- **Rendimiento**: permitir procesar varias URLs (posibilidad de limitar pestañas en paralelo).
- **Compatibilidad**: inicialmente Chrome (Manifest V3); luego se podría portar a Firefox.
- **Escalabilidad**: backend que permita múltiples usuarios concurrentes.
- **UX**: navegación visible y natural (no headless).
- **Logging**: Sistema de logs detallado para debugging y seguimiento de errores.
