const EXTENSION_ID = 'iibdlpgbeaecmfaanjnlagkgbccnfiab';

export function initAutomation() {
    return new Promise((resolve) => {
        try {
            // Verificar si la extensión está instalada
            if (!window.chrome || !window.chrome.runtime) {
                console.error('Chrome runtime no disponible');
                resolve(false);
                return;
            }

            // Intentar establecer conexión con la extensión
            chrome.runtime.sendMessage(EXTENSION_ID, { type: 'PING' }, response => {
                if (chrome.runtime.lastError) {
                    console.error('Error al conectar con la extensión:', chrome.runtime.lastError);
                    resolve(false);
                    return;
                }
                console.log('Conexión establecida con la extensión');
                resolve(true);
            });
        } catch (error) {
            console.error('Error al inicializar la automatización:', error);
            resolve(false);
        }
    });
}

export function startCampaign(urls, template) {
    return new Promise((resolve, reject) => {
        try {
            if (!window.chrome || !window.chrome.runtime) {
                reject(new Error('Chrome runtime no disponible'));
                return;
            }

            console.log('Iniciando campaña con:', { urls, template });

            chrome.runtime.sendMessage(EXTENSION_ID, {
                type: 'START_CAMPAIGN',
                urls: urls,
                template: template
            }, response => {
                if (chrome.runtime.lastError) {
                    console.error('Error de la extensión:', chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (!response) {
                    reject(new Error('No se recibió respuesta de la extensión'));
                    return;
                }

                if (response.error) {
                    reject(new Error(response.error));
                    return;
                }

                console.log('Campaña iniciada correctamente:', response);
                resolve(response);
            });
        } catch (error) {
            console.error('Error al iniciar la campaña:', error);
            reject(error);
        }
    });
}

export function stopCampaign() {
    return new Promise((resolve, reject) => {
        try {
            if (!window.chrome || !window.chrome.runtime) {
                reject(new Error('Chrome runtime no disponible'));
                return;
            }

            chrome.runtime.sendMessage(EXTENSION_ID, {
                type: 'STOP_CAMPAIGN'
            }, response => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                resolve(response);
            });
        } catch (error) {
            console.error('Error al detener la campaña:', error);
            reject(error);
        }
    });
}
