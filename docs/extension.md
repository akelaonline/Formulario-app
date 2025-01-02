# Detalles de la Extensión

## 1. Estructura de Archivos (Manifest V3)

Ejemplo de `manifest.json`:
```json
{
  "name": "Automation Extension",
  "version": "1.0.0",
  "manifest_version": 3,
  "permissions": ["tabs", "storage", "scripting"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["contentScript.js"]
    }
  ]
}

2. Background Script
Funcionalidades:
Guardar el token en chrome.storage.local tras login.
Abrir pestañas (chrome.tabs.create) al iniciar campaña.
Recibir mensajes del content script indicando resultado y reportarlo al backend.
Comunicarse con el popup (login, obtención de datos).
3. Popup
UI:
Form de login (email, password).
Secciones para Categorías, URLs, Plantillas.
Sección de Campañas para crear, iniciar, pausar.
Al hacer clic en “Iniciar Campaña”, avisa al background script.
4. Content Script
Detección de Formulario:
Buscar <form> y <input> con nombres/labels de “name, email, message”.
O usar selectores predefinidos si están en la BD.
Rellenado y Submit:
Asigna input.value = ... basado en la plantilla.
form.submit() o clic en el botón de enviar.
Captchas:
Si se detecta, avisar al background para resolver (ver captcha.md).
Comunicación:
chrome.runtime.sendMessage({ urlId, estado, mensaje }) tras terminar.
