let currentCampaign = null;

// Escuchar mensajes de la aplicación web
chrome.runtime.onMessageExternal.addListener(
  async (message, sender, sendResponse) => {
    console.log('Mensaje recibido en background:', message);

    // Manejar ping para verificar conexión
    if (message.type === 'PING') {
      console.log('Ping recibido, respondiendo...');
      sendResponse({ success: true });
      return true;
    }

    if (message.type === 'START_CAMPAIGN') {
      try {
        if (!message.urls || !message.template) {
          throw new Error('URLs o template no proporcionados');
        }

        if (!message.template.fields || !Array.isArray(message.template.fields)) {
          throw new Error('Template inválido: no contiene campos o no es un array');
        }

        currentCampaign = {
          urls: message.urls,
          template: message.template,
          currentIndex: 0
        };

        console.log('Iniciando campaña con:', currentCampaign);

        // Procesar la primera URL
        await processNextUrl();
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error en la campaña:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true;
    }

    if (message.type === 'STOP_CAMPAIGN') {
      currentCampaign = null;
      sendResponse({ success: true });
      return true;
    }
  }
);

async function processNextUrl() {
  if (!currentCampaign || currentCampaign.currentIndex >= currentCampaign.urls.length) {
    console.log('Campaña completada');
    currentCampaign = null;
    return;
  }

  const url = currentCampaign.urls[currentCampaign.currentIndex];
  console.log('Procesando URL:', url);

  try {
    // Crear ventana
    const window = await chrome.windows.create({
      url: url,
      type: 'popup',
      width: 1024,
      height: 768,
      focused: false
    });

    // Esperar a que la página cargue
    await new Promise((resolve) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === window.tabs[0].id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });

    // Esperar un momento adicional para asegurar que todo el contenido dinámico se cargue
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Inyectar y ejecutar el script
    console.log('Ejecutando script con template:', currentCampaign.template);
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: window.tabs[0].id },
      func: fillForm,
      args: [currentCampaign.template]
    });

    console.log('Resultado de la automatización:', results);

    // Esperar antes de cerrar la ventana
    await new Promise(resolve => setTimeout(resolve, 2000));
    await chrome.windows.remove(window.id);

    // Procesar siguiente URL
    currentCampaign.currentIndex++;
    await processNextUrl();

  } catch (error) {
    console.error('Error procesando URL:', error);
    throw error;
  }
}

// Función que se inyecta en la página
async function fillForm(template) {
  console.log('Iniciando llenado con template:', template);

  // Función para esperar elementos
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Elemento no encontrado: ${selector}`));
      }, timeout);
    });
  }

  // Función para simular retraso
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  try {
    // Procesar cada campo
    for (const field of template.fields) {
      console.log('Procesando campo:', field);
      
      // Buscar el campo (probar diferentes selectores)
      const selectors = [
        `input[name="${field.name}"]`,
        `textarea[name="${field.name}"]`,
        `input[id="${field.name}"]`,
        `textarea[id="${field.name}"]`,
        `input[placeholder*="${field.name}"]`,
        `textarea[placeholder*="${field.name}"]`
      ];

      let input = null;
      for (const selector of selectors) {
        try {
          input = await waitForElement(selector, 2000);
          if (input) {
            console.log('Campo encontrado con selector:', selector);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!input) {
        console.error(`No se pudo encontrar el campo: ${field.name}`);
        continue;
      }

      // Simular clic
      input.click();
      await sleep(Math.random() * 200 + 100);

      // Limpiar campo
      input.value = '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(Math.random() * 200 + 100);

      // Escribir valor
      for (const char of field.value.toString()) {
        input.value += char;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(Math.random() * 100 + 50);
      }

      await sleep(Math.random() * 500 + 200);
    }

    // Buscar y hacer clic en el botón de envío (probar diferentes selectores)
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Enviar")',
      'input[value="Enviar"]',
      'button:contains("Submit")',
      'button.submit',
      'input.submit'
    ];

    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        submitButton = await waitForElement(selector, 2000);
        if (submitButton) {
          console.log('Botón de envío encontrado con selector:', selector);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (submitButton) {
      submitButton.click();
      await sleep(2000);
    } else {
      console.error('No se pudo encontrar el botón de envío');
    }

    return { success: true };
  } catch (error) {
    console.error('Error en fillForm:', error);
    return { success: false, error: error.message };
  }
}
