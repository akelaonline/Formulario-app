# Form Filler - Automatización de Formularios

Aplicación web para la automatización de llenado de formularios con gestión de campañas y plantillas.

## Tecnologías

- React + Vite (Frontend)
- Firebase (Backend y Hosting)
- Mercado Pago (Pagos)

## Estructura del Proyecto

formulario-app/
├── src/
│   ├── components/          # Componentes React
│   ├── pages/              # Páginas de la aplicación
│   ├── services/           # Servicios (Firebase, pagos)
│   └── context/            # Contextos de React

## Instalación

1. Clonar el repositorio:
```bash
git clone [url-repositorio]
cd formulario-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear archivo `.env` con:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Características

### Para Usuarios
- Autenticación con email/password y Google
- Creación y gestión de campañas
- Editor de plantillas
- Panel de control con estadísticas
- Suscripción mensual ($100 USD)

### Para Administradores
- Panel de administración de usuarios
- Métricas y estadísticas
- Gestión de pagos y suscripciones

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Vista previa de la build de producción
- `npm run lint`: Ejecuta el linter
- `npm test`: Ejecuta los tests

## Seguridad

- Autenticación mediante Firebase Auth
- Reglas de Firestore para protección de datos
- Roles de usuario (admin/usuario)
- Validación de suscripciones activas

## Responsive Design

La aplicación está diseñada para funcionar en:
- Escritorio (1024px+)
- Tablet (768px - 1023px)
- Móvil (320px - 767px)

## Flujo de Trabajo Git

1. Crear rama para nueva característica:
```bash
git checkout -b feature/nombre-caracteristica
```

2. Commit de cambios:
```bash
git commit -m "tipo(alcance): descripción"
```

3. Push y Pull Request a main:
```bash
git push origin feature/nombre-caracteristica
```

## Convenciones de Código

- Nombres de componentes: PascalCase
- Nombres de funciones y variables: camelCase
- Archivos de componentes: .jsx
- Archivos de estilos: .css
- Imports absolutos desde src/

## Contribución

1. Fork del repositorio
2. Crear rama de característica
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
