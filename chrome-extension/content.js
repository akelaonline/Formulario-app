// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FILL_FORM') {
        fillForm(message.template)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Mantener el canal de comunicación abierto para la respuesta asíncrona
    }
});

// Función para llenar el formulario
async function fillForm(template) {
    try {
        // Rellenar cada campo del formulario
        for (const field of template.fields) {
            try {
                // Esperar a que el campo esté disponible
                const input = await waitForElement(
                    `input[name="${field.name}"], textarea[name="${field.name}"]`
                );

                // Limpiar el campo
                input.click();
                input.value = '';
                input.dispatchEvent(new Event('change', { bubbles: true }));

                // Escribir el valor simulando comportamiento humano
                for (const char of field.value) {
                    input.value += char;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    await sleep(Math.random() * 100 + 50);
                }

                // Pausa aleatoria entre campos
                await sleep(Math.random() * 1000 + 500);
            } catch (error) {
                console.error(`Error en campo ${field.name}:`, error);
            }
        }

        // Buscar y hacer clic en el botón de envío
        const submitButton = await waitForElement('button[type="submit"], input[type="submit"]');
        submitButton.click();

        // Esperar a que se complete el envío
        await sleep(2000);

    } catch (error) {
        console.error('Error al llenar el formulario:', error);
        throw error;
    }
}

// Funciones auxiliares
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
