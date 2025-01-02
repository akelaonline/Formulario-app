# Proyecto de Extensión de Navegador para Llenado de Formularios

Este repositorio contiene el código y la documentación para una **extensión de navegador** (Chrome/Firefox) que automatiza el llenado de formularios de contacto en sitios web, controlada desde un **backend** que gestiona usuarios, categorías, URLs, plantillas y campañas.

## Contenido Principal

- **Carpeta [`docs/`](./docs/)**:
  - [`requirements.md`](./docs/requirements.md): Requerimientos Funcionales
  - [`architecture.md`](./docs/architecture.md): Diseño de Arquitectura
  - [`api-spec.md`](./docs/api-spec.md): Especificación de la API (endpoints REST)
  - [`extension.md`](./docs/extension.md): Detalles de la Extensión (background script, popup, content scripts)
  - [`captcha.md`](./docs/captcha.md): Manejo de Captchas (2Captcha, etc.)
  - [`testing.md`](./docs/testing.md): Plan de Pruebas
  - [`deploy.md`](./docs/deploy.md): Guía de Configuración y Despliegue
  - [`checklist.md`](./docs/checklist.md): Pasos y Tareas de Implementación

## Estructura Básica del Proyecto

- **Backend**: Código del servidor (Node.js, Python, etc.) que maneja la lógica de autenticación, CRUD de datos, etc.
- **Extensión**: Código del Manifest, background script, popup y content scripts para Chrome/Firefox.
- **Documentación**: En la carpeta `docs/`.

Revisa cada documento para tener una guía clara de cómo desarrollar cada parte y cómo realizar el despliegue final.
