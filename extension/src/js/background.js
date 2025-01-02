// Manejar la instalación de la extensión
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Configuración inicial
        chrome.storage.local.set({
            autofillMode: 'automatic',
            skipCaptcha: false
        });
    }
});

// Manejar mensajes del content script y popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'FIELD_SELECTED':
            // Reenviar el mensaje al popup
            chrome.runtime.sendMessage(message);
            break;
        
        case 'FILL_FORM':
            handleFormFill(sender.tab.id, message.data);
            break;

        case 'FORM_FILLED':
            // Notificar al popup que el formulario fue llenado
            chrome.runtime.sendMessage({
                type: 'FORM_STATUS',
                status: 'completed',
                tabId: sender.tab.id
            });
            break;

        case 'CAPTCHA_DETECTED':
            handleCaptcha(sender.tab.id);
            break;

        case 'START_CAMPAIGN':
            handleCampaign(message.campaign);
            break;
    }
    return true;
});

// Manejar el llenado de formularios
async function handleFormFill(tabId, data) {
    try {
        const { template, mode, skipCaptcha } = data;

        // Enviar datos al content script
        await chrome.tabs.sendMessage(tabId, {
            type: 'START_FILL',
            data: {
                template,
                mode,
                skipCaptcha
            }
        });

    } catch (error) {
        console.error('Error al llenar formulario:', error);
        // Notificar error al popup
        chrome.runtime.sendMessage({
            type: 'FORM_STATUS',
            status: 'error',
            error: error.message,
            tabId
        });
    }
}

// Manejar detección de captcha
async function handleCaptcha(tabId) {
    try {
        // Activar la pestaña con el captcha
        await chrome.tabs.update(tabId, { active: true });
        
        // Notificar al popup
        chrome.runtime.sendMessage({
            type: 'FORM_STATUS',
            status: 'captcha_required',
            tabId
        });

    } catch (error) {
        console.error('Error al manejar captcha:', error);
    }
}

// Manejar la ejecución de campañas
async function handleCampaign(campaign) {
    try {
        // Actualizar estado de la campaña
        await api.updateCampaignStatus(campaign.id, 'running');

        // Procesar cada URL
        for (const url of campaign.urls) {
            // Abrir la URL en una nueva pestaña
            const tab = await chrome.tabs.create({ url: url.url, active: false });

            // Esperar a que la página cargue
            await new Promise(resolve => {
                chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                    if (tabId === tab.id && info.status === 'complete') {
                        chrome.tabs.onUpdated.removeListener(listener);
                        resolve();
                    }
                });
            });

            // Llenar el formulario
            await chrome.tabs.sendMessage(tab.id, {
                type: 'FILL_FORM',
                template: campaign.template
            });

            // Actualizar estado de la URL
            await api.updateCampaignUrlStatus(campaign.id, url.id, 'completed');

            // Cerrar la pestaña
            await chrome.tabs.remove(tab.id);
        }

        // Actualizar estado final de la campaña
        await api.updateCampaignStatus(campaign.id, 'completed');

    } catch (error) {
        console.error('Error al ejecutar la campaña:', error);
        await api.updateCampaignStatus(campaign.id, 'error');
    }
}
