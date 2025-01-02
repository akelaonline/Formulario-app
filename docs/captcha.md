## 5. `captcha.md`

```markdown
# Manejo de Captchas

## 1. Tipos de Captchas Soportados

- reCAPTCHA v2 (checkbox)
- reCAPTCHA invisible / v3
- hCaptcha
- Captchas de imagen simples (texto en una imagen)

## 2. Estrategias de Resolución

1. **Servicio de Terceros (2Captcha, AntiCaptcha, etc.)**:
   - El content script detecta el captcha (p. ej. `iframe` con `recaptcha`) y extrae la `sitekey`.
   - Envía al background: `{ sitekey, pageUrl }`.
   - El background llama a la API externa usando `CAPTCHA_SERVICE_KEY`.
   - Una vez resuelto, envía el token al content script, que lo inyecta y hace submit.

2. **Resolución Manual**:
   - El content script notifica al background: “Se encontró captcha, se requiere acción manual”.
   - El usuario lo resuelve directamente (dependiendo de la implementación).
   - El content script recibe la solución, la inyecta y hace submit.

## 3. Flujo de Resolución

1. Content script detecta el captcha → `sendMessage` al background.
2. Background script llama al servicio (o solicita al usuario que resuelva).
3. Background recibe el token/respuesta → se lo pasa al content script.
4. Content script inyecta la respuesta y hace submit.

